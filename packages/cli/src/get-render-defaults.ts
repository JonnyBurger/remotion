import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderDefaults} from '@remotion/studio-shared';
import {ConfigInternals} from './config';
import {parsedCli} from './parsed-cli';

const {
	x264Option,
	audioBitrateOption,
	offthreadVideoCacheSizeInBytesOption,
	scaleOption,
	jpegQualityOption,
	videoBitrateOption,
	enforceAudioOption,
	mutedOption,
	colorSpaceOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	numberOfGifLoopsOption,
	beepOnFinishOption,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	reproOption,
	logLevelOption,
	delayRenderTimeoutInMillisecondsOption,
	forSeamlessAacConcatenationOption,
	audioCodecOption,
	hardwareAccelerationOption,
	chromeModeOption,
} = BrowserSafeApis.options;

export const getRenderDefaults = (): RenderDefaults => {
	const defaultJpegQuality = jpegQualityOption.getValue({
		commandLine: parsedCli,
	}).value;
	const logLevel = logLevelOption.getValue({commandLine: parsedCli}).value;
	const defaultCodec = ConfigInternals.getOutputCodecOrUndefined();
	const concurrency = RenderInternals.resolveConcurrency(
		ConfigInternals.getConcurrency(),
	);
	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = ConfigInternals.getProResProfile() ?? 'hq';

	const x264Preset = x264Option.getValue({
		commandLine: parsedCli,
	}).value;
	const audioBitrate = audioBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const offthreadVideoCacheSizeInBytes =
		offthreadVideoCacheSizeInBytesOption.getValue({
			commandLine: parsedCli,
		}).value;
	const defaultScale = scaleOption.getValue({
		commandLine: parsedCli,
	}).value;
	const videoBitrate = videoBitrateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const enforceAudioTrack = enforceAudioOption.getValue({
		commandLine: parsedCli,
	}).value;
	const muted = mutedOption.getValue({
		commandLine: parsedCli,
	}).value;
	const colorSpace = colorSpaceOption.getValue({
		commandLine: parsedCli,
	}).value;
	const multiProcessOnLinux = enableMultiprocessOnLinuxOption.getValue({
		commandLine: parsedCli,
	}).value;
	const gl = glOption.getValue({
		commandLine: parsedCli,
	}).value;
	const numberOfGifLoops = numberOfGifLoopsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const beepOnFinish = beepOnFinishOption.getValue({
		commandLine: parsedCli,
	}).value;
	const encodingMaxRate = encodingMaxRateOption.getValue({
		commandLine: parsedCli,
	}).value;
	const encodingBufferSize = encodingBufferSizeOption.getValue({
		commandLine: parsedCli,
	}).value;
	const repro = reproOption.getValue({
		commandLine: parsedCli,
	}).value;
	const delayRenderTimeout = delayRenderTimeoutInMillisecondsOption.getValue({
		commandLine: parsedCli,
	}).value;
	const forSeamlessAacConcatenation =
		forSeamlessAacConcatenationOption.getValue({
			commandLine: parsedCli,
		}).value;
	const audioCodec = audioCodecOption.getValue({
		commandLine: parsedCli,
	}).value;
	const hardwareAcceleration = hardwareAccelerationOption.getValue({
		commandLine: parsedCli,
	}).value;
	const chromeMode = chromeModeOption.getValue({
		commandLine: parsedCli,
	}).value;

	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const stillImageFormat = ConfigInternals.getUserPreferredStillImageFormat();
	const videoImageFormat = ConfigInternals.getUserPreferredVideoImageFormat();
	const disableWebSecurity = ConfigInternals.getChromiumDisableWebSecurity();
	const ignoreCertificateErrors = ConfigInternals.getIgnoreCertificateErrors();
	const userAgent = ConfigInternals.getChromiumUserAgent();
	const metadata = ConfigInternals.getMetadata();

	const maxConcurrency = RenderInternals.getMaxConcurrency();
	const minConcurrency = RenderInternals.getMinConcurrency();

	return {
		jpegQuality: defaultJpegQuality ?? RenderInternals.DEFAULT_JPEG_QUALITY,
		scale: defaultScale ?? 1,
		logLevel,
		codec: defaultCodec ?? 'h264',
		concurrency,
		maxConcurrency,
		minConcurrency,
		stillImageFormat:
			stillImageFormat ?? RenderInternals.DEFAULT_STILL_IMAGE_FORMAT,
		videoImageFormat:
			videoImageFormat ?? RenderInternals.DEFAULT_VIDEO_IMAGE_FORMAT,
		muted,
		enforceAudioTrack,
		proResProfile,
		x264Preset: x264Preset ?? 'medium',
		pixelFormat,
		audioBitrate,
		videoBitrate,
		encodingBufferSize,
		encodingMaxRate,
		everyNthFrame,
		delayRenderTimeout,
		audioCodec,
		disableWebSecurity,
		ignoreCertificateErrors,
		openGlRenderer: gl,
		offthreadVideoCacheSizeInBytes,
		colorSpace,
		multiProcessOnLinux,
		userAgent,
		repro,
		numberOfGifLoops,
		beepOnFinish,
		forSeamlessAacConcatenation,
		metadata,
		hardwareAcceleration,
		chromeMode,
	};
};
