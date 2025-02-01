import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {defaultBrowserDownloadProgress} from './browser-download-bar';
import {registerCleanupJob} from './cleanup-before-quit';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parsed-cli';
import {printCompositions} from './print-compositions';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';

const {
	enableMultiprocessOnLinuxOption,
	offthreadVideoCacheSizeInBytesOption,
	glOption,
	delayRenderTimeoutInMillisecondsOption,
	binariesDirectoryOption,
	publicPathOption,
	publicDirOption,
	chromeModeOption,
} = BrowserSafeApis.options;

export const listCompositionsCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint({
		args,
		remotionRoot,
		logLevel,
		allowDirectory: true,
	});

	if (!file) {
		Log.error(
			{indent: false, logLevel},
			'The `compositions` command requires you to specify a entry point. For example',
		);
		Log.error(
			{indent: false, logLevel},
			'  npx remotion compositions src/index.ts',
		);
		Log.error(
			{indent: false, logLevel},
			'See https://www.remotion.dev/docs/register-root for more information.',
		);
		process.exit(1);
	}

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		file,
		'reason:',
		reason,
	);

	const {
		browserExecutable,
		envVariables,
		inputProps,
		ignoreCertificateErrors,
		userAgent,
		disableWebSecurity,
	} = getCliOptions({
		isStill: false,
		logLevel,
		indent: false,
	});

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux: enableMultiprocessOnLinuxOption.getValue({
			commandLine: parsedCli,
		}).value,
		gl: glOption.getValue({commandLine: parsedCli}).value,
		ignoreCertificateErrors,
		userAgent,
	};

	const publicPath = publicPathOption.getValue({commandLine: parsedCli}).value;
	const timeoutInMilliseconds = delayRenderTimeoutInMillisecondsOption.getValue(
		{
			commandLine: parsedCli,
		},
	).value;
	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const publicDir = publicDirOption.getValue({commandLine: parsedCli}).value;
	const chromeMode = chromeModeOption.getValue({
		commandLine: parsedCli,
	}).value;

	const {urlOrBundle: bundled, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			remotionRoot,
			fullPath: file,
			publicDir,
			onProgress: () => undefined,
			indentOutput: false,
			logLevel,
			onDirectoryCreated: (dir) => {
				registerCleanupJob(`Delete ${dir}`, () =>
					RenderInternals.deleteDirectory(dir),
				);
			},
			quietProgress: false,
			quietFlag: quietFlagProvided(),
			outDir: null,
			// Not needed for compositions
			gitSource: null,
			bufferStateDelayInMilliseconds: null,
			maxTimelineTracks: null,
			publicPath,
		});

	registerCleanupJob(`Cleanup bundle`, () => cleanupBundle());

	const compositions = await RenderInternals.internalGetCompositions({
		serveUrlOrWebpackUrl: bundled,
		browserExecutable,
		chromiumOptions,
		envVariables,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				staticBase: null,
				indent: undefined,
			}).serializedString,
		timeoutInMilliseconds,
		port: getRendererPortFromConfigFileAndCliFlag(),
		indent: false,
		onBrowserLog: null,
		puppeteerInstance: undefined,
		logLevel,
		server: undefined,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		onBrowserDownload: defaultBrowserDownloadProgress({
			indent: false,
			logLevel,
			quiet: quietFlagProvided(),
		}),
		chromeMode,
	});

	printCompositions(compositions, logLevel);
};
