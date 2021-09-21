import {AwsRegion} from '../..';
import {
	chunkKey,
	encodingProgressKey,
	lambdaInitializedPrefix,
	renderMetadataKey,
	RenderProgress,
	rendersPrefix,
} from '../../shared/constants';
import {estimatePriceFromBucket} from './calculate-price-from-bucket';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {formatCostsInfo} from './format-costs-info';
import {getCleanupProgress} from './get-cleanup-progress';
import {getCurrentRegionInFunction} from './get-current-region';
import {getEncodingMetadata} from './get-encoding-metadata';
import {getFinalEncodingStatus} from './get-final-encoding-status';
import {getPostRenderData} from './get-post-render-data';
import {getRenderMetadata} from './get-render-metadata';
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import {isFatalError} from './is-fatal-error';

export const getProgress = async ({
	bucketName,
	renderId,
	expectedBucketOwner,
	region,
	memorySizeInMb,
}: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
}): Promise<RenderProgress> => {
	const postRenderData = await getPostRenderData({
		bucketName,
		region,
		renderId,
		expectedBucketOwner,
	});

	if (postRenderData) {
		return {
			bucket: bucketName,
			bucketSize: postRenderData.bucketSize,
			chunks: postRenderData.renderMetadata.totalChunks,
			cleanup: {
				done: true,
				filesDeleted: postRenderData.filesCleanedUp,
				filesToDelete: postRenderData.filesCleanedUp,
			},
			costs: {
				accruedSoFar: postRenderData.cost.estimatedCost,
				displayCost: postRenderData.cost.estimatedDisplayCost,
				currency: postRenderData.cost.currency,
				disclaimer: postRenderData.cost.disclaimer,
			},
			currentTime: Date.now(),
			done: true,
			encodingStatus: {
				framesEncoded:
					postRenderData.renderMetadata.videoConfig.durationInFrames,
			},
			errors: postRenderData.errors,
			fatalErrorEncountered: false,
			lambdasInvoked: postRenderData.renderMetadata.totalChunks,
			outputFile: postRenderData.outputFile,
			renderId,
			renderMetadata: postRenderData.renderMetadata,
			timeToFinish: postRenderData.timeToFinish,
		};
	}

	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		region: getCurrentRegionInFunction(),
		expectedBucketOwner,
	});

	const [encodingStatus, renderMetadata, errorExplanations] = await Promise.all(
		[
			getEncodingMetadata({
				exists: Boolean(
					contents.find((c) => c.Key === encodingProgressKey(renderId))
				),
				bucketName,
				renderId,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
			getRenderMetadata({
				exists: Boolean(
					contents.find((c) => c.Key === renderMetadataKey(renderId))
				),
				bucketName,
				renderId,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
			inspectErrors({
				contents,
				renderId,
				bucket: bucketName,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
		]
	);

	const accruedSoFar = Number(
		estimatePriceFromBucket({
			renderId,
			contents,
			renderMetadata,
			bucketName,
			memorySizeInMb,
		})
	);

	const outputFile = findOutputFileInBucket({
		bucketName,
		contents,
		renderId,
		renderMetadata,
		type: 'video',
	});

	const cleanup = getCleanupProgress({
		chunkCount: renderMetadata?.totalChunks ?? 0,
		contents,
		output: outputFile?.url ?? null,
		renderId,
	});

	const timeToFinish = getTimeToFinish({
		lastModified: outputFile?.lastModified ?? null,
		renderMetadata,
	});

	const chunks = contents.filter((c) => c.Key?.startsWith(chunkKey(renderId)));

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const lambdasInvoked = outputFile
		? renderMetadata?.totalChunks ?? 0
		: contents.filter((c) =>
				c.Key?.startsWith(lambdaInitializedPrefix(renderId))
		  ).length;

	return {
		chunks: outputFile ? renderMetadata?.totalChunks ?? 0 : chunks.length,
		done: Boolean(outputFile && cleanup?.done),
		encodingStatus: getFinalEncodingStatus({
			encodingStatus,
			outputFileExists: Boolean(outputFile),
			renderMetadata,
		}),
		costs: formatCostsInfo(accruedSoFar),
		renderId,
		renderMetadata,
		bucket: bucketName,
		outputFile: outputFile?.url ?? null,
		timeToFinish,
		errors: errorExplanations,
		fatalErrorEncountered: errorExplanations.some(isFatalError),
		currentTime: Date.now(),
		bucketSize,
		lambdasInvoked,
		cleanup,
	};
};
