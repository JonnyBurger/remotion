import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {defaultBrowserDownloadProgress} from './browser-download-bar';
import {chalk} from './chalk';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parsed-cli';

export const GPU_COMMAND = 'gpu';

const {
	enableMultiprocessOnLinuxOption,
	glOption,
	delayRenderTimeoutInMillisecondsOption,
	chromeModeOption,
} = BrowserSafeApis.options;

export const gpuCommand = async (logLevel: LogLevel) => {
	const {
		browserExecutable,
		disableWebSecurity,
		ignoreCertificateErrors,
		userAgent,
	} = getCliOptions({
		isStill: false,
		logLevel,
		indent: false,
	});

	const enableMultiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({commandLine: parsedCli}).value;
	const puppeteerTimeout = delayRenderTimeoutInMillisecondsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const chromeMode = chromeModeOption.getValue({
		commandLine: parsedCli,
	}).value;

	const onBrowserDownload = defaultBrowserDownloadProgress({
		quiet: quietFlagProvided(),
		indent: false,
		logLevel,
	});

	await RenderInternals.internalEnsureBrowser({
		browserExecutable,
		indent: false,
		logLevel,
		onBrowserDownload,
		chromeMode,
	});

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux,
		gl,
		ignoreCertificateErrors,
		userAgent,
	};

	const statuses = await RenderInternals.getChromiumGpuInformation({
		browserExecutable,
		indent: false,
		logLevel,
		chromiumOptions,
		timeoutInMilliseconds: puppeteerTimeout,
		onBrowserDownload: defaultBrowserDownloadProgress({
			indent: false,
			logLevel,
			quiet: quietFlagProvided(),
		}),
		chromeMode,
	});
	for (const {feature, status} of statuses) {
		Log.info({indent: false, logLevel}, `${feature}: ${colorStatus(status)}`);
	}
};

const colorStatus = (status: string) => {
	if (status === 'Enabled') {
		return chalk.green(status);
	}

	if (status === 'Hardware accelerated') {
		return chalk.green(status);
	}

	if (status === 'Disabled') {
		return chalk.red(status);
	}

	if (status === 'Software only. Hardware acceleration disabled') {
		return chalk.red(status);
	}

	if (status === 'Software only, hardware acceleration unavailable') {
		return chalk.red(status);
	}

	return status;
};
