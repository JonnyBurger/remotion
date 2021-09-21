import {InvokeCommand} from '@aws-sdk/client-lambda';
import fs from 'fs';
import pRetry from 'p-retry';
import {Internals} from 'remotion';
import {validateFramesPerLambda} from '../api/validate-frames-per-lambda';
import {getLambdaClient} from '../shared/aws-clients';
import {chunk} from '../shared/chunk';
import {
	CURRENT_VERSION,
	EncodingProgress,
	encodingProgressKey,
	LambdaPayload,
	LambdaRoutines,
	outName,
	RenderMetadata,
	renderMetadataKey,
	rendersPrefix,
} from '../shared/constants';
import {getServeUrlHash} from '../shared/make-s3-url';
import {collectChunkInformation} from './chunk-optimization/collect-data';
import {getFrameRangesFromProfile} from './chunk-optimization/get-frame-ranges-from-profile';
import {getProfileDuration} from './chunk-optimization/get-profile-duration';
import {isValidOptimizationProfile} from './chunk-optimization/is-valid-profile';
import {optimizeInvocationOrder} from './chunk-optimization/optimize-invocation-order';
import {optimizeProfileRecursively} from './chunk-optimization/optimize-profile';
import {planFrameRanges} from './chunk-optimization/plan-frame-ranges';
import {
	getOptimization,
	writeOptimization,
} from './chunk-optimization/s3-optimization-file';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {concatVideosS3} from './helpers/concat-videos';
import {createPostRenderData} from './helpers/create-post-render-data';
import {deleteChunks} from './helpers/delete-chunks';
import {
	closeBrowser,
	getBrowserInstance,
	quitBrowser,
} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {lambdaLs, lambdaWriteFile} from './helpers/io';
import {isErrInsufficientResourcesErr} from './helpers/is-enosp-err';
import {timer} from './helpers/timer';
import {validateComposition} from './helpers/validate-composition';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';
import {writePostRenderData} from './helpers/write-post-render-data';

type Options = {
	expectedBucketOwner: string;
};

const innerLaunchHandler = async (params: LambdaPayload, options: Options) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	if (!params.framesPerLambda) {
		throw new Error('You need to pass "framesPerLambda" parameter');
	}

	validateFramesPerLambda(params.framesPerLambda);

	const [, optimization] = await Promise.all([
		getBrowserInstance(),
		getOptimization({
			bucketName: params.bucketName,
			siteId: getServeUrlHash(params.serveUrl),
			compositionId: params.composition,
			region: getCurrentRegionInFunction(),
			expectedBucketOwner: options.expectedBucketOwner,
		}),
	]);

	const comp = await pRetry(
		async () =>
			validateComposition({
				serveUrl: params.serveUrl,
				composition: params.composition,
				browserInstance: await getBrowserInstance(),
				inputProps: params.inputProps,
				onError: ({err}) => {
					writeLambdaError({
						bucketName: params.bucketName,
						errorInfo: {
							chunk: null,
							frame: null,
							isFatal: false,
							stack: (err.message + ' ' + err.stack) as string,
							type: 'browser',
							tmpDir: getTmpDirStateIfENoSp(err.stack as string),
						},
						expectedBucketOwner: options.expectedBucketOwner,
						renderId: params.renderId,
					});
				},
			}),
		{
			retries: 1,
			onFailedAttempt: async (err) => {
				if (isErrInsufficientResourcesErr(err.message)) {
					await writeLambdaError({
						bucketName: params.bucketName,
						errorInfo: {
							chunk: null,
							frame: null,
							isFatal: false,
							stack: err.stack as string,
							tmpDir: null,
							type: 'stitcher',
						},
						expectedBucketOwner: options.expectedBucketOwner,
						renderId: params.renderId,
					});
					await quitBrowser();
					deleteTmpDir();
				}
			},
		}
	);
	Internals.validateDurationInFrames(
		comp.durationInFrames,
		'passed to <Component />'
	);
	Internals.validateFps(comp.fps, 'passed to <Component />');
	Internals.validateDimension(comp.height, 'height', 'passed to <Component />');
	Internals.validateDimension(comp.width, 'width', 'passed to <Component />');

	const {framesPerLambda} = params;
	const chunkCount = Math.ceil(comp.durationInFrames / framesPerLambda);

	const {chunks, didUseOptimization} = planFrameRanges({
		chunkCount,
		framesPerLambda,
		frameCount: comp.durationInFrames,
		optimization,
	});
	const sortedChunks = chunks.slice().sort((a, b) => a[0] - b[0]);
	const invokers = Math.round(Math.sqrt(chunks.length));

	const reqSend = timer('sending off requests');
	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: sortedChunks.indexOf(chunkPayload),
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: comp.durationInFrames,
			bucketName: params.bucketName,
			retriesLeft: params.maxRetries,
			inputProps: params.inputProps,
			renderId: params.renderId,
			imageFormat: params.imageFormat,
			codec: params.codec,
			crf: params.crf,
			envVariables: params.envVariables,
			pixelFormat: params.pixelFormat,
			proResProfile: params.proResProfile,
			quality: params.quality,
		};
		return payload;
	});
	const renderMetadata: RenderMetadata = {
		startedDate: Date.now(),
		videoConfig: comp,
		totalChunks: chunks.length,
		estimatedLambdaInvokations: [
			// Direct invokations
			chunks.length,
			// Parent invokers
			invokers,
			// This function
		].reduce((a, b) => a + b, 0),
		compositionId: comp.id,
		siteId: getServeUrlHash(params.serveUrl),
		codec: params.codec,
		usesOptimizationProfile: didUseOptimization,
		type: 'video',
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		lambdaVersion: CURRENT_VERSION,
		framesPerLambda: params.framesPerLambda,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
	};

	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: renderMetadataKey(params.renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		acl: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
	});

	const payloadChunks = chunk(lambdaPayloads, invokers);
	await Promise.all(
		payloadChunks.map(async (payloads, index) => {
			const callingLambdaTimer = timer('Calling chunk ' + index);
			const firePayload: LambdaPayload = {
				type: LambdaRoutines.fire,
				payloads,
				renderId: params.renderId,
			};
			await getLambdaClient(getCurrentRegionInFunction()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(firePayload),
					InvocationType: 'Event',
				}),
				{}
			);
			callingLambdaTimer.end();
		})
	);
	reqSend.end();

	// TODO: Should throttle?
	const onProgress = (framesEncoded: number) => {
		const encodingProgress: EncodingProgress = {
			framesEncoded,
		};
		lambdaWriteFile({
			bucketName: params.bucketName,
			key: encodingProgressKey(params.renderId),
			body: JSON.stringify(encodingProgress),
			region: getCurrentRegionInFunction(),
			acl: 'private',
			expectedBucketOwner: options.expectedBucketOwner,
		});
	};

	// TODO: Should clean up afterwards
	const out = await concatVideosS3({
		bucket: params.bucketName,
		expectedFiles: chunkCount,
		onProgress,
		numberOfFrames: comp.durationInFrames,
		renderId: params.renderId,
		region: getCurrentRegionInFunction(),
		codec: params.codec,
		expectedBucketOwner: options.expectedBucketOwner,
	});
	// TODO: Enable or disable chunk optimization
	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: outName(params.renderId, params.codec),
		body: fs.createReadStream(out),
		region: getCurrentRegionInFunction(),
		acl: 'public-read',
		expectedBucketOwner: options.expectedBucketOwner,
	});
	const chunkData = await collectChunkInformation({
		bucketName: params.bucketName,
		renderId: params.renderId,
		region: getCurrentRegionInFunction(),
		expectedBucketOwner: options.expectedBucketOwner,
	});
	const optimizedProfile = optimizeInvocationOrder(
		optimizeProfileRecursively(chunkData, 400)
	);

	const optimizedFrameRange = getFrameRangesFromProfile(optimizedProfile);
	if (isValidOptimizationProfile(optimizedProfile)) {
		await writeOptimization({
			bucketName: params.bucketName,
			optimization: {
				frameRange: optimizedFrameRange,
				oldTiming: getProfileDuration(chunkData),
				newTiming: getProfileDuration(optimizedProfile),
				frameCount: comp.durationInFrames,
				createdFromRenderId: params.renderId,
				framesPerLambda,
				lambdaVersion: CURRENT_VERSION,
			},
			expectedBucketOwner: options.expectedBucketOwner,
			compositionId: params.composition,
			siteId: getServeUrlHash(params.serveUrl),
			region: getCurrentRegionInFunction(),
		});
	}

	const contents = await lambdaLs({
		bucketName: params.bucketName,
		prefix: rendersPrefix(params.renderId),
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
	});

	// TODO: Opportunity to parallelize
	const postRenderData = await createPostRenderData({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		renderMetadata,
		contents,
	});
	await writePostRenderData({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		postRenderData,
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
	});
	await deleteChunks({
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
		bucket: params.bucketName,
		chunkCount,
		contents,
	});
};

export const launchHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	try {
		await innerLaunchHandler(params, options);
	} catch (err) {
		console.log('Error occurred', err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				chunk: null,
				frame: null,
				stack: (err as Error).stack as string,
				type: 'stitcher',
				isFatal: true,
				tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
			},
			expectedBucketOwner: options.expectedBucketOwner,
			renderId: params.renderId,
		});
	} finally {
		await closeBrowser();
	}
};
