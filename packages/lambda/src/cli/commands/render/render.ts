import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import path from 'path';
import {NoReactInternals} from 'remotion/no-react';
import {internalDownloadMedia} from '../../../api/download-media';
import {getRenderProgress} from '../../../api/get-render-progress';
import {internalRenderMediaOnLambdaRaw} from '../../../api/render-media-on-lambda';

import type {EnhancedErrorInfo, ProviderSpecifics} from '@remotion/serverless';
import {
	validateFramesPerFunction,
	validatePrivacy,
	type ServerlessCodec,
} from '@remotion/serverless/client';
import type {AwsProvider} from '../../../functions/aws-implementation';
import {parseFunctionName} from '../../../functions/helpers/parse-function-name';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../../shared/constants';
import {sleep} from '../../../shared/sleep';
import {validateMaxRetries} from '../../../shared/validate-retries';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {getWebhookCustomData} from '../../helpers/get-webhook-custom-data';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {makeProgressString} from './progress';

export const RENDER_COMMAND = 'render';

const {
	x264Option,
	audioBitrateOption,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
	mutedOption,
	colorSpaceOption,
	deleteAfterOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	numberOfGifLoopsOption,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	delayRenderTimeoutInMillisecondsOption,
	overwriteOption,
	binariesDirectoryOption,
	preferLosslessOption,
	metadataOption,
} = BrowserSafeApis.options;

export const renderCommand = async ({
	args,
	remotionRoot,
	logLevel,
	providerSpecifics,
}: {
	args: string[];
	remotionRoot: string;
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error({indent: false, logLevel}, 'No serve URL passed.');
		Log.info(
			{indent: false, logLevel},
			'Pass an additional argument specifying a URL where your Remotion project is hosted.',
		);
		Log.info({indent: false, logLevel});
		Log.info(
			{indent: false, logLevel},
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id> [output-location]`,
		);
		quit(1);
	}

	const region = getAwsRegion();

	const {
		envVariables,
		frameRange,
		inputProps,
		pixelFormat,
		proResProfile,
		everyNthFrame,
		height,
		width,
		browserExecutable,
		ignoreCertificateErrors,
		userAgent,
		disableWebSecurity,
	} = CliInternals.getCliOptions({
		isStill: false,
		logLevel,
		indent: false,
	});

	const x264Preset = x264Option.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: CliInternals.parsedCli,
		}).value;
	const scale = scaleOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const crf = crfOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const muted = mutedOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const colorSpace = colorSpaceOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const deleteAfter = deleteAfterOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const gl = glOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const numberOfGifLoops = numberOfGifLoopsOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const encodingMaxRate = encodingMaxRateOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const encodingBufferSize = encodingBufferSizeOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const timeoutInMilliseconds = delayRenderTimeoutInMillisecondsOption.getValue(
		{
			commandLine: CliInternals.parsedCli,
		},
	).value;
	const overwrite = overwriteOption.getValue(
		{
			commandLine: CliInternals.parsedCli,
		},
		false,
	).value;
	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const preferLossless = preferLosslessOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const metadata = metadataOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		ignoreCertificateErrors,
		userAgent,
	};

	let composition: string = args[1];
	if (!composition) {
		Log.info(
			{indent: false, logLevel},
			'No compositions passed. Fetching compositions...',
		);

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.',
			);
		}

		const server = await RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
			remotionRoot,
			logLevel,
			webpackConfigOrServeUrl: serveUrl,
			offthreadVideoCacheSizeInBytes,
			binariesDirectory,
			forceIPv4: false,
		});

		const indent = false;

		const {compositionId} =
			await CliInternals.getCompositionWithDimensionOverride({
				args: args.slice(1),
				compositionIdFromUi: null,
				browserExecutable,
				chromiumOptions,
				envVariables,
				height,
				indent,
				serializedInputPropsWithCustomSchema:
					NoReactInternals.serializeJSONWithDate({
						indent: undefined,
						staticBase: null,
						data: inputProps,
					}).serializedString,
				port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
				puppeteerInstance: undefined,
				serveUrlOrWebpackUrl: serveUrl,
				timeoutInMilliseconds,
				logLevel,
				width,
				server,
				offthreadVideoCacheSizeInBytes,
				binariesDirectory,
				onBrowserDownload: CliInternals.defaultBrowserDownloadProgress({
					indent,
					logLevel,
					quiet: CliInternals.quietFlagProvided(),
				}),
				chromeMode: 'headless-shell',
			});
		composition = compositionId;
	}

	const outName = parsedLambdaCli['out-name'];
	const downloadName = args[2] ?? null;

	const {value: codec, source: reason} =
		BrowserSafeApis.options.videoCodecOption.getValue(
			{
				commandLine: CliInternals.parsedCli,
			},
			{
				downloadName,
				outName: outName ?? null,
				configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
				uiCodec: null,
				compositionCodec: null,
			},
		);

	const imageFormat = CliInternals.getVideoImageFormat({
		codec,
		uiImageFormat: null,
	});

	const functionName = await findFunctionName({logLevel, providerSpecifics});

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy, true);
	const framesPerLambda = parsedLambdaCli['frames-per-lambda'] ?? undefined;
	validateFramesPerFunction({
		framesPerFunction: framesPerLambda,
		durationInFrames: 1,
	});

	const webhookCustomData = getWebhookCustomData(logLevel);

	const res = await internalRenderMediaOnLambdaRaw({
		functionName,
		serveUrl,
		inputProps,
		codec: codec as ServerlessCodec,
		imageFormat,
		crf: crf ?? undefined,
		envVariables,
		pixelFormat,
		proResProfile,
		jpegQuality,
		region,
		maxRetries,
		composition,
		framesPerLambda: framesPerLambda ?? null,
		privacy,
		logLevel,
		frameRange: frameRange ?? null,
		outName: parsedLambdaCli['out-name'] ?? null,
		timeoutInMilliseconds,
		chromiumOptions,
		scale,
		numberOfGifLoops,
		everyNthFrame,
		concurrencyPerLambda: parsedLambdaCli['concurrency-per-lambda'] ?? 1,
		muted,
		overwrite,
		audioBitrate,
		videoBitrate,
		encodingBufferSize,
		encodingMaxRate,
		forceHeight: height,
		forceWidth: width,
		webhook: parsedLambdaCli.webhook
			? {
					url: parsedLambdaCli.webhook,
					secret: parsedLambdaCli['webhook-secret'] ?? null,
					customData: webhookCustomData,
				}
			: null,
		rendererFunctionName: parsedLambdaCli['renderer-function-name'] ?? null,
		forceBucketName: parsedLambdaCli['force-bucket-name'] ?? null,
		audioCodec:
			CliInternals.parsedCli[BrowserSafeApis.options.audioCodecOption.cliFlag],
		deleteAfter: deleteAfter ?? null,
		colorSpace,
		downloadBehavior: {type: 'play-in-browser'},
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		x264Preset: x264Preset ?? null,
		preferLossless,
		indent: false,
		forcePathStyle: parsedLambdaCli['force-path-style'] ?? false,
		metadata: metadata ?? null,
		apiKey:
			parsedLambdaCli[BrowserSafeApis.options.apiKeyOption.cliFlag] ?? null,
	});

	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		// No browser logs in Lambda
		updatesDontOverwrite: false,
		indent: false,
	});

	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Bucket: ${CliInternals.makeHyperlink({text: res.bucketName, fallback: res.bucketName, url: `https://${getAwsRegion()}.console.aws.amazon.com/s3/buckets/${res.bucketName}/?region=${getAwsRegion()}`})}`,
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Function: ${CliInternals.makeHyperlink({text: functionName, fallback: functionName, url: `https://${getAwsRegion()}.console.aws.amazon.com/lambda/home#/functions/${functionName}?tab=code`})}`,
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Render ID: ${CliInternals.makeHyperlink({text: res.renderId, fallback: res.renderId, url: res.folderInS3Console})}`,
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`progress.json: ${CliInternals.makeHyperlink({
				text: (clickInstruction) => {
					return `${clickInstruction} to view`;
				},
				fallback: res.progressJsonInConsole,
				url: res.progressJsonInConsole,
			})}`,
		),
	);
	Log.info(
		{
			indent: false,
			logLevel,
		},
		CliInternals.chalk.gray(
			`${CliInternals.makeHyperlink({
				text: 'Codec',
				fallback: 'Codec',
				url: 'https://remotion.dev/docs/encoding',
			})}: ${codec} (${reason})`,
		),
	);

	Log.verbose(
		{indent: false, logLevel},
		'CloudWatch logs (if enabled):',
		CliInternals.makeHyperlink({
			text: `Main function`,
			url: res.cloudWatchMainLogs,
			fallback: res.cloudWatchMainLogs,
		}),
		CliInternals.makeHyperlink({
			text: `Renderer functions`,
			url: res.cloudWatchLogs,
			fallback: res.cloudWatchLogs,
		}),
	);
	Log.verbose(
		{indent: false, logLevel},
		'Lambda insights: (if enabled):',
		CliInternals.makeHyperlink({
			text: (instruction) => `${instruction} to view`,
			url: res.lambdaInsightsLogs,
			fallback: res.lambdaInsightsLogs,
		}),
	);

	if (!CliInternals.supportsHyperlink()) {
		Log.verbose(
			{indent: false, logLevel},
			CliInternals.makeHyperlink({
				text: (instruction) => `${instruction} for Render folder`,
				url: res.folderInS3Console,
				fallback: `Render folder: ${res.folderInS3Console}`,
			}),
		);
	}

	const adheresToFunctionNameConvention = parseFunctionName(functionName);

	const status = await getRenderProgress({
		functionName,
		bucketName: res.bucketName,
		renderId: res.renderId,
		region: getAwsRegion(),
		logLevel,
		skipLambdaInvocation: Boolean(adheresToFunctionNameConvention),
	});
	progressBar.update(
		makeProgressString({
			downloadInfo: null,
			overall: status,
		}),
		false,
	);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		await sleep(500);
		const newStatus = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
			logLevel,
		});
		progressBar.update(
			makeProgressString({
				downloadInfo: null,
				overall: newStatus,
			}),
			false,
		);

		if (newStatus.done) {
			let downloadOrNothing;

			if (downloadName) {
				const downloadStart = Date.now();
				const download = await internalDownloadMedia({
					bucketName: res.bucketName,
					outPath: downloadName,
					region: getAwsRegion(),
					renderId: res.renderId,
					logLevel,
					onProgress: ({downloaded, totalSize}) => {
						progressBar.update(
							makeProgressString({
								downloadInfo: {
									doneIn: null,
									downloaded,
									totalSize,
								},
								overall: newStatus,
							}),
							false,
						);
					},
					providerSpecifics: providerSpecifics,
					forcePathStyle: parsedLambdaCli['force-path-style'],
				});
				downloadOrNothing = download;
				progressBar.update(
					makeProgressString({
						downloadInfo: {
							doneIn: Date.now() - downloadStart,
							downloaded: download.sizeInBytes,
							totalSize: download.sizeInBytes,
						},
						overall: newStatus,
					}),
					false,
				);
			}

			Log.info({indent: false, logLevel});
			Log.info(
				{indent: false, logLevel},
				CliInternals.chalk.blue('+ S3 '.padEnd(CliInternals.LABEL_WIDTH)),
				CliInternals.chalk.blue(
					CliInternals.makeHyperlink({
						fallback: newStatus.outputFile as string,
						text: newStatus.outKey as string,
						url: newStatus.outputFile as string,
					}),
				),
				CliInternals.chalk.gray(
					CliInternals.formatBytes(newStatus.outputSizeInBytes as number),
				),
			);

			if (downloadOrNothing) {
				const relativeOutputPath = path.relative(
					process.cwd(),
					downloadOrNothing.outputPath,
				);
				Log.info(
					{indent: false, logLevel},
					CliInternals.chalk.blue('↓'.padEnd(CliInternals.LABEL_WIDTH)),
					CliInternals.chalk.blue(
						CliInternals.makeHyperlink({
							url: `file://${downloadOrNothing.outputPath}`,
							text: relativeOutputPath,
							fallback: downloadOrNothing.outputPath,
						}),
					),
					CliInternals.chalk.gray(
						CliInternals.formatBytes(downloadOrNothing.sizeInBytes),
					),
				);
			}

			Log.info({indent: false, logLevel});
			Log.info(
				{indent: false, logLevel},
				[
					newStatus.renderMetadata
						? `${newStatus.renderMetadata.estimatedTotalLambdaInvokations} λ's used`
						: null,
					newStatus.timeToFinish
						? `${(newStatus.timeToFinish / 1000).toFixed(2)}sec`
						: null,
					`Estimated cost ${newStatus.costs.displayCost}`,
				]
					.filter(Boolean)
					.join(', '),
			);
			if (newStatus.mostExpensiveFrameRanges) {
				Log.verbose({indent: false, logLevel}, 'Most expensive frame ranges:');
				Log.verbose(
					{indent: false, logLevel},
					newStatus.mostExpensiveFrameRanges
						.map((f) => {
							return `${f.frameRange[0]}-${f.frameRange[1]} (Chunk ${f.chunk}, ${f.timeInMilliseconds}ms)`;
						})
						.join(', '),
				);
			}

			quit(0);
		}

		if (newStatus.fatalErrorEncountered) {
			Log.error({indent: false, logLevel}, '\n');
			const uniqueErrors: EnhancedErrorInfo[] = [];
			for (const err of newStatus.errors) {
				if (uniqueErrors.find((e) => e.stack === err.stack)) {
					continue;
				}

				uniqueErrors.push(err);
				if (err.explanation) {
					Log.error({indent: false, logLevel}, err.explanation);
				}

				const frames = RenderInternals.parseStack(err.stack.split('\n'));

				const errorWithStackFrame = new RenderInternals.SymbolicateableError({
					message: err.message,
					frame: err.frame,
					name: err.name,
					stack: err.stack,
					stackFrame: frames,
					chunk: err.chunk,
				});
				await CliInternals.printError(errorWithStackFrame, logLevel);
			}

			Log.info({indent: false, logLevel});
			Log.info(
				{indent: false, logLevel},
				`Accrued costs until error was thrown: ${newStatus.costs.displayCost}.`,
			);
			Log.info(
				{indent: false, logLevel},
				'This is an estimate and continuing Lambda functions may incur additional costs.',
			);
			quit(1);
		}
	}
};
