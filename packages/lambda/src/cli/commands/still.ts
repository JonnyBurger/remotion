import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ProviderSpecifics} from '@remotion/serverless';
import {validatePrivacy} from '@remotion/serverless/client';
import path from 'path';
import {NoReactInternals} from 'remotion/no-react';
import {internalDownloadMedia} from '../../api/download-media';
import {renderStillOnLambda} from '../../api/render-still-on-lambda';
import type {AwsProvider} from '../../functions/aws-implementation';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../shared/constants';
import {getS3RenderUrl} from '../../shared/get-aws-urls';
import {validateMaxRetries} from '../../shared/validate-retries';
import {validateServeUrl} from '../../shared/validate-serveurl';
import {parsedLambdaCli} from '../args';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {quit} from '../helpers/quit';
import {Log} from '../log';
import {makeArtifactProgress} from './render/progress';

const {
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	deleteAfterOption,
	jpegQualityOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	delayRenderTimeoutInMillisecondsOption,
	binariesDirectoryOption,
} = BrowserSafeApis.options;

const {
	parsedCli,
	determineFinalStillImageFormat,
	chalk,
	getCliOptions,
	formatBytes,
	getCompositionWithDimensionOverride,
} = CliInternals;

export const STILL_COMMAND = 'still';

export const stillCommand = async ({
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
			`${BINARY_NAME} ${STILL_COMMAND} <serve-url> <composition-id>  [output-location]`,
		);
		quit(1);
	}

	const {
		envVariables,
		inputProps,
		stillFrame,
		height,
		width,
		browserExecutable,
		userAgent,
		disableWebSecurity,
		ignoreCertificateErrors,
	} = getCliOptions({
		isStill: true,
		logLevel,
		indent: false,
	});

	const region = getAwsRegion();
	let composition = args[1];

	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: parsedCli}).value;
	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		ignoreCertificateErrors,
		userAgent,
	};

	const timeoutInMilliseconds = delayRenderTimeoutInMillisecondsOption.getValue(
		{
			commandLine: parsedCli,
		},
	).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;

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

		const {compositionId} = await getCompositionWithDimensionOverride({
			args: args.slice(1),
			compositionIdFromUi: null,
			indent,
			serveUrlOrWebpackUrl: serveUrl,
			logLevel,
			browserExecutable,
			chromiumOptions,
			envVariables,
			serializedInputPropsWithCustomSchema:
				NoReactInternals.serializeJSONWithDate({
					indent: undefined,
					staticBase: null,
					data: inputProps,
				}).serializedString,
			port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
			puppeteerInstance: undefined,
			timeoutInMilliseconds,
			height,
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

	const downloadName = args[2] ?? null;
	const outName = parsedLambdaCli['out-name'];

	const functionName = await findFunctionName({logLevel, providerSpecifics});

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy, true);

	const {format: imageFormat, source: imageFormatReason} =
		determineFinalStillImageFormat({
			downloadName,
			outName: outName ?? null,
			cliFlag: parsedCli['image-format'] ?? null,
			isLambda: true,
			fromUi: null,
			configImageFormat:
				ConfigInternals.getUserPreferredStillImageFormat() ?? null,
		});

	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Function: ${CliInternals.makeHyperlink({text: functionName, fallback: functionName, url: `https://${getAwsRegion()}.console.aws.amazon.com/lambda/home#/functions/${functionName}?tab=code`})}`,
		),
	);

	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Image Format = ${imageFormat} (${imageFormatReason})`,
		),
	);

	const deleteAfter = parsedLambdaCli[deleteAfterOption.cliFlag];
	const scale = scaleOption.getValue({
		commandLine: parsedCli,
	}).value;
	const jpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;

	const res = await renderStillOnLambda({
		functionName,
		serveUrl,
		inputProps,
		imageFormat,
		composition,
		privacy,
		region,
		maxRetries,
		envVariables,
		frame: stillFrame,
		jpegQuality,
		logLevel,
		outName,
		chromiumOptions,
		timeoutInMilliseconds,
		scale,
		forceHeight: height,
		forceWidth: width,
		onInit: ({cloudWatchLogs, lambdaInsightsUrl}) => {
			Log.verbose(
				{indent: false, logLevel},
				`${CliInternals.makeHyperlink({
					text: 'CloudWatch Logs',
					url: cloudWatchLogs,
					fallback: `CloudWatch Logs: ${cloudWatchLogs}`,
				})} (if enabled)`,
			);
			Log.verbose(
				{indent: false, logLevel},
				`${CliInternals.makeHyperlink({
					text: 'Lambda Insights',
					url: lambdaInsightsUrl,
					fallback: `Lambda Insights: ${lambdaInsightsUrl}`,
				})} (if enabled)`,
			);
		},
		deleteAfter,
	});
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Render ID: ${CliInternals.makeHyperlink({text: res.renderId, fallback: res.renderId, url: getS3RenderUrl({bucketName: res.bucketName, renderId: res.renderId, region: getAwsRegion()})})}`,
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.gray(
			`Bucket: ${CliInternals.makeHyperlink({text: res.bucketName, fallback: res.bucketName, url: `https://${getAwsRegion()}.console.aws.amazon.com/s3/buckets/${res.bucketName}/?region=${getAwsRegion()}`})}`,
		),
	);

	const artifactProgress = makeArtifactProgress(res.artifacts);
	if (artifactProgress) {
		Log.info(
			{
				indent: false,
				logLevel,
			},
			makeArtifactProgress(res.artifacts),
		);
	}

	Log.info(
		{indent: false, logLevel},
		chalk.blue('+ S3'.padEnd(CliInternals.LABEL_WIDTH)),
		chalk.blue(
			CliInternals.makeHyperlink({
				fallback: res.url,
				url: res.url,
				text: res.outKey,
			}),
		),
		chalk.gray(formatBytes(res.sizeInBytes)),
	);

	if (downloadName) {
		const {outputPath, sizeInBytes} = await internalDownloadMedia({
			bucketName: res.bucketName,
			outPath: downloadName,
			region,
			renderId: res.renderId,
			logLevel,
			providerSpecifics: providerSpecifics,
			forcePathStyle: parsedLambdaCli['force-path-style'],
		});
		const relativePath = path.relative(process.cwd(), outputPath);
		Log.info(
			{indent: false, logLevel},
			chalk.blue('↓'.padEnd(CliInternals.LABEL_WIDTH)),
			chalk.blue(
				CliInternals.makeHyperlink({
					url: 'file://' + outputPath,
					text: relativePath,
					fallback: outputPath,
				}),
			),
			chalk.gray(formatBytes(sizeInBytes)),
		);
	}
};
