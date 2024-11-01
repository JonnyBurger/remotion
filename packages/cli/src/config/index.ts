import {getBrowser} from './browser';
import {getBrowserExecutable} from './browser-executable';
import {
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
} from './chromium-flags';
import {getConcurrency} from './concurrency';
import {getDotEnvLocation} from './env-file';
import {getRange, setFrameRangeFromCli} from './frame-range';
import {
	getUserPreferredStillImageFormat,
	getUserPreferredVideoImageFormat,
	setStillImageFormat,
	setVideoImageFormat,
} from './image-format';
import {getShouldOutputImageSequence} from './image-sequence';
import {getOutputLocation} from './output-location';
import {
	defaultOverrideFunction,
	getWebpackOverrideFn,
} from './override-webpack';
import {getPixelFormat} from './pixel-format';
import {
	getRendererPortFromConfigFile,
	getRendererPortFromConfigFileAndCliFlag,
	getStudioPort,
} from './preview-server';
import {getProResProfile} from './prores-profile';
import {getStillFrame, setStillFrame} from './still-frame';

import type {WebpackConfiguration} from '@remotion/bundler';
import type {
	BrowserExecutable,
	CodecOrUndefined,
	ColorSpace,
	Crf,
	DeleteAfter,
	FrameRange,
	NumberOfGifLoops,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {setBrowserExecutable} from './browser-executable';
import {
	getBufferStateDelayInMilliseconds,
	setBufferStateDelayInMilliseconds,
} from './buffer-state-delay-in-milliseconds';
import {
	setChromiumDisableWebSecurity,
	setChromiumIgnoreCertificateErrors,
} from './chromium-flags';
import type {Concurrency} from './concurrency';
import {setConcurrency} from './concurrency';
import {getEntryPoint, setEntryPoint} from './entry-point';
import {setDotEnvLocation} from './env-file';
import {getEveryNthFrame, setEveryNthFrame} from './every-nth-frame';
import {
	getFfmpegOverrideFunction,
	setFfmpegOverrideFunction,
} from './ffmpeg-override';
import {setFrameRange} from './frame-range';
import {getHeight, overrideHeight} from './height';
import {setImageSequence} from './image-sequence';
import {
	getKeyboardShortcutsEnabled,
	setKeyboardShortcutsEnabled,
} from './keyboard-shortcuts';
import {getMetadata, setMetadata} from './metadata';
import {setNumberOfSharedAudioTags} from './number-of-shared-audio-tags';
import {getShouldOpenBrowser, setShouldOpenBrowser} from './open-browser';
import {setOutputLocation} from './output-location';
import type {WebpackOverrideFn} from './override-webpack';
import {overrideWebpackConfig} from './override-webpack';
import {setPixelFormat} from './pixel-format';
import {setPort, setRendererPort, setStudioPort} from './preview-server';
import {setProResProfile} from './prores-profile';
import {getChromiumUserAgent, setChromiumUserAgent} from './user-agent';
import {
	getWebpackPolling,
	setWebpackPollingInMilliseconds,
} from './webpack-poll';
import {getWidth, overrideWidth} from './width';

export type {Concurrency, WebpackConfiguration, WebpackOverrideFn};

const {
	offthreadVideoCacheSizeInBytesOption,
	x264Option,
	audioBitrateOption,
	videoBitrateOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	enforceAudioOption,
	overwriteOption,
	mutedOption,
	videoCodecOption,
	colorSpaceOption,
	deleteAfterOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	headlessOption,
	numberOfGifLoopsOption,
	beepOnFinishOption,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	reproOption,
	enableLambdaInsights,
	logLevelOption,
	delayRenderTimeoutInMillisecondsOption,
	publicDirOption,
	binariesDirectoryOption,
	preferLosslessOption,
	forSeamlessAacConcatenationOption,
	audioCodecOption,
	publicPathOption,
} = BrowserSafeApis.options;

declare global {
	interface RemotionBundlingOptions {
		/**
		 * Specify the entry point so you don't have to specify it in the
		 * CLI command
		 */
		readonly setEntryPoint: (src: string) => void;

		/**
		 * @deprecated
		 * Use `setStudioPort()` and `setRendererPort()` instead.
		 */
		readonly setPort: (port: number | undefined) => void;

		/**
		 * Set the HTTP port used by the Studio.
		 * By default, Remotion will try to find a free port.
		 * If you specify a port, but it's not available, Remotion will throw an error.
		 */
		readonly setStudioPort: (port: number | undefined) => void;

		/**
		 * Set the HTTP port used to host the Webpack bundle.
		 * By default, Remotion will try to find a free port.
		 * If you specify a port, but it's not available, Remotion will throw an error.
		 */
		readonly setRendererPort: (port: number | undefined) => void;
		/**
		 * Define the location of the public/ directory.
		 * By default it is a folder named "public" inside the current working directory.
		 * You can set an absolute path or a relative path that will be resolved from the closest package.json location.
		 */
		readonly setPublicDir: (publicDir: string | null) => void;
		readonly overrideWebpackConfig: (f: WebpackOverrideFn) => void;
	}
	// Legacy config format: New options to not need to be added here.
	interface RemotionConfigObject {
		/**
		 * Change the maximum amount of tracks that are shown in the timeline.
		 * @param maxTracks The maximum amount of timeline tracks that you would like to show.
		 * @default 15
		 */
		readonly setMaxTimelineTracks: (maxTracks: number) => void;
		/**
		 * Enable Keyboard shortcuts in the Remotion Studio.
		 * @param enabled Boolean whether to enable the keyboard shortcuts
		 * @default true
		 */
		readonly setKeyboardShortcutsEnabled: (enableShortcuts: boolean) => void;
		/**
		 * Set number of shared audio tags. https://www.remotion.dev/docs/player/autoplay#use-the-numberofsharedaudiotags-property
		 * @param numberOfAudioTags
		 * @default 0
		 */
		readonly setNumberOfSharedAudioTags: (numberOfAudioTags: number) => void;
		/**
		 * Enable Webpack polling instead of file system listeners for hot reloading in the Studio.
		 * This is useful if you are using a remote directory or a virtual machine.
		 * @param interval
		 * @default null
		 */
		readonly setWebpackPollingInMilliseconds: (interval: number | null) => void;
		/**
		 * Whether Remotion should open a browser when starting the Studio.
		 * @param should
		 * @default true
		 */
		readonly setShouldOpenBrowser: (should: boolean) => void;
		/**
		 * Set the log level.
		 * Acceptable values: 'error' | 'warning' | 'info' | 'verbose'
		 * Default value: 'info'
		 *
		 * Set this to 'verbose' to get browser logs and other IO.
		 */
		readonly setLevel: (
			newLogLevel: 'verbose' | 'info' | 'warn' | 'error',
		) => void;
		/**
		 * Specify executable path for the browser to use.
		 * Default: null, which will make Remotion find or download a version of said browser.
		 */
		readonly setBrowserExecutable: (
			newBrowserExecutablePath: BrowserExecutable,
		) => void;
		/**
		 * Set how many milliseconds a frame may take to render before it times out.
		 * Default: `30000`
		 */
		readonly setDelayRenderTimeoutInMilliseconds: (
			newPuppeteerTimeout: number,
		) => void;
		/**
		 * @deprecated Renamed to `setDelayRenderTimeoutInMilliseconds`.
		 * Set how many milliseconds a frame may take to render before it times out.
		 * Default: `30000`
		 */
		readonly setTimeoutInMilliseconds: (newPuppeteerTimeout: number) => void;
		/**
		 * Setting deciding whether to disable CORS and other Chrome security features.
		 * Default: false
		 */
		readonly setChromiumDisableWebSecurity: (should: boolean) => void;
		/**
		 * Setting whether to ignore any invalid SSL certificates, such as self-signed ones.
		 * Default: false
		 */
		readonly setChromiumIgnoreCertificateErrors: (should: boolean) => void;
		/**
		 * If false, will open an actual browser during rendering to observe progress.
		 * Default: true
		 */
		readonly setChromiumHeadlessMode: (should: boolean) => void;
		/**
		 * Set the OpenGL rendering backend for Chrome. Possible values: 'egl', 'angle', 'swiftshader', 'swangle', 'vulkan' and 'angle-egl'.
		 * Default: 'swangle' in Lambda, null elsewhere.
		 */
		readonly setChromiumOpenGlRenderer: (
			renderer:
				| 'swangle'
				| 'angle'
				| 'egl'
				| 'swiftshader'
				| 'vulkan'
				| 'angle-egl',
		) => void;
		/**
		 * Set the user agent for Chrome. Only works during rendering.
		 * Default is the default user agent for Chrome
		 */
		readonly setChromiumUserAgent: (userAgent: string | null) => void;
		/**
		 * Set a custom location for a .env file.
		 * Default: `.env`
		 */
		readonly setDotEnvLocation: (file: string) => void;
		/**
		 * Sets how many Puppeteer instances will work on rendering your video in parallel.
		 * Default: `null`, meaning half of the threads available on your CPU.
		 */
		readonly setConcurrency: (newConcurrency: Concurrency) => void;
		/**
		 * @deprecated Renamed to `setJpegQuality`.
		 */
		readonly setQuality: (q: never) => void;
		/**
		 * @deprecated Separated into `setStillImageFormat()` and `setVideoImageFormat()`.
		 */
		readonly setImageFormat: (q: never) => void;
		/**
		 * Set the JPEG quality for the frames.
		 * Must be between 0 and 100.
		 * Default: 80
		 */
		readonly setJpegQuality: (q: number | undefined) => void;
		/** Decide the image format for still renders.
		 */
		readonly setStillImageFormat: (format: StillImageFormat) => void;
		/** Decide in which image format to render. Can be either 'jpeg' or 'png'.
		 * PNG is slower, but supports transparency.
		 */
		readonly setVideoImageFormat: (format: VideoImageFormat) => void;
		/**
		 * Render only a subset of a video.
		 * Pass in a tuple [20, 30] to only render frames 20-30 into a video.
		 * Pass in a single number `20` to only render a single frame as an image.
		 * The frame count starts at 0.
		 */
		readonly setFrameRange: (newFrameRange: FrameRange | null) => void;
		/**
		 * Scales the output dimensions by a factor.
		 * Default: 1.
		 */
		readonly setScale: (newScale: number) => void;
		/**
		 * Specify which frames should be picked for rendering a GIF
		 * Default: 1, which means every frame
		 * https://remotion.dev/docs/render-as-gif
		 */
		readonly setEveryNthFrame: (frame: number) => void;
		/**
		 * Specify the number of Loop a GIF should have.
		 * Default: null (means GIF will loop infinite)
		 */
		readonly setNumberOfGifLoops: (newLoop: NumberOfGifLoops) => void;
		/**
		 * Disable audio output.
		 * Default: false
		 */
		readonly setMuted: (muted: boolean) => void;
		/**
		 * Don't render an audio track if it would be silent.
		 * Default: true
		 */
		readonly setEnforceAudioTrack: (enforceAudioTrack: boolean) => void;

		/**
		 * Prepare a video for later seamless audio concatenation.
		 * Default: false
		 */
		readonly setForSeamlessAacConcatenation: (
			forSeamlessAacConcatenation: boolean,
		) => void;

		/**
		 * Set the output file location string. Default: `out/{composition}.{codec}`
		 */
		readonly setOutputLocation: (newOutputLocation: string) => void;
		/**
		 * If the video file already exists, should Remotion overwrite
		 * the output? Default: true
		 */
		readonly setOverwriteOutput: (newOverwrite: boolean) => void;
		/**
		 * Sets the pixel format in FFmpeg.
		 * See https://trac.ffmpeg.org/wiki/Chroma%20Subsampling for an explanation.
		 * You can override this using the `--pixel-format` Cli flag.
		 */
		readonly setPixelFormat: (
			format:
				| 'yuv420p'
				| 'yuva420p'
				| 'yuv422p'
				| 'yuv444p'
				| 'yuv420p10le'
				| 'yuv422p10le'
				| 'yuv444p10le'
				| 'yuva444p10le',
		) => void;
		/**
		 * Specify the codec for stitching the frames into a video.
		 * Can be `h264` (default), `h265`, `vp8` or `vp9`
		 */
		readonly setCodec: (newCodec: CodecOrUndefined) => void;
		/**
		 * Set the Constant Rate Factor to pass to FFmpeg.
		 * Lower values mean better quality, but be aware that the ranges of
		 * possible values greatly differs between codecs.
		 */
		readonly setCrf: (newCrf: Crf) => void;
		/**
		 * Set to true if don't want a video but an image sequence as the output.
		 */
		readonly setImageSequence: (newImageSequence: boolean) => void;
		/**
		 * Overrides the height of a composition
		 */
		readonly overrideHeight: (newHeight: number) => void;
		/**
		 * Overrides the width of a composition
		 */
		readonly overrideWidth: (newWidth: number) => void;
		/**
		 * Set the ProRes profile.
		 * This method is only valid if the codec has been set to 'prores'.
		 * Possible values: 4444-xq, 4444, hq, standard, light, proxy. Default: 'hq'
		 * See https://avpres.net/FFmpeg/im_ProRes.html for meaning of possible values.
		 */
		readonly setProResProfile: (
			profile:
				| '4444-xq'
				| '4444'
				| 'hq'
				| 'standard'
				| 'light'
				| 'proxy'
				| undefined,
		) => void;

		readonly setX264Preset: (
			profile:
				| 'ultrafast'
				| 'superfast'
				| 'veryfast'
				| 'faster'
				| 'fast'
				| 'medium'
				| 'slow'
				| 'slower'
				| 'veryslow'
				| 'placebo'
				| null,
		) => void;
		/**
		 * Override the arguments that Remotion passes to FFmpeg.
		 * Consult https://remotion.dev/docs/renderer/render-media#ffmpegoverride before using this feature.
		 */
		readonly overrideFfmpegCommand: (
			command: (info: {
				type: 'pre-stitcher' | 'stitcher';
				args: string[];
			}) => string[],
		) => void;

		/**
		 * Set a target audio bitrate to be passed to FFmpeg.
		 */
		readonly setAudioBitrate: (bitrate: string | null) => void;

		/**
		 * Set a target video bitrate to be passed to FFmpeg.
		 * Mutually exclusive with setCrf().
		 */
		readonly setVideoBitrate: (bitrate: string | null) => void;

		/**
		 * Set a maximum bitrate to be passed to FFmpeg.
		 */
		readonly setEncodingMaxRate: (bitrate: string | null) => void;

		/**
		 * Set a buffer size to be passed to FFmpeg.
		 */
		readonly setEncodingBufferSize: (bitrate: string | null) => void;

		/**
		 * Opt into bt709 rendering.
		 */
		readonly setColorSpace: (colorSpace: ColorSpace) => void;

		/**
		 * Removes the --single-process flag that gets passed to
			Chromium on Linux by default. This will make the render faster because
			multiple processes can be used, but may cause issues with some Linux
			distributions or if window server libraries are missing.
		 */
		readonly setChromiumMultiProcessOnLinux: (
			multiProcessOnLinux: boolean,
		) => void;

		/**
		 * Whether the Remotion Studio should play a beep sound when a render has finished.
		 */
		readonly setBeepOnFinish: (beepOnFinish: boolean) => void;

		/**
		 * Collect information that you can submit to Remotion if asked for a reproduction.
		 */
		readonly setRepro: (enableRepro: boolean) => void;
		/**
		 * The directory where the platform-specific binaries and libraries needed
			for Remotion are located.
		 */
		readonly setBinariesDirectory: (directory: string | null) => void;
		/**
		 * Prefer lossless audio encoding. Default: false
		 */
		readonly setPreferLosslessAudio: (lossless: boolean) => void;
		/**
		 * Prefer lossless audio encoding. Default: false
		 */
		readonly setPublicPath: (publicPath: string | null) => void;
	}
}

type FlatConfig = RemotionConfigObject &
	RemotionBundlingOptions & {
		/**
		 * Set the audio codec to use for the output video.
		 * See the Encoding guide in the docs for defaults and available options.
		 */
		setAudioCodec: (codec: 'pcm-16' | 'aac' | 'mp3' | 'opus') => void;
		setOffthreadVideoCacheSizeInBytes: (size: number | null) => void;

		setDeleteAfter: (day: DeleteAfter | null) => void;
		/**
		 * Set whether S3 buckets should be allowed to expire.
		 */
		setEnableFolderExpiry: (value: boolean | null) => void;
		/**
		 * Set whether Lambda Insights should be enabled when deploying a function.
		 */
		setLambdaInsights: (value: boolean) => void;
		/**
		 * Set the amount of milliseconds after which the Player in the Studio will display a buffering UI after the Player has entered a buffer state.
		 */
		setBufferStateDelayInMilliseconds: (delay: number | null) => void;

		setMetadata: (metadata: Record<string, string>) => void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Bundling.*()` calls to `Config.*()` in your config file.'
		 */
		Bundling: void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Preview.*()` calls to `Config.*()` in your config file.'
		 */
		Preview: void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Log.*()` calls to `Config.*()` in your config file.'
		 */
		Log: void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Puppeteer.*()` calls to `Config.*()` in your config file.'
		 */
		Puppeteer: void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Rendering.*()` calls to `Config.*()` in your config file.'
		 */
		Rendering: void;
		/**
		 * @deprecated 'The config format has changed. Change `Config.Output.*()` calls to `Config.*()` in your config file.'
		 */
		Output: void;
	};

export const Config: FlatConfig = {
	get Bundling() {
		throw new Error(
			'The config format has changed. Change `Config.Bundling.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Rendering() {
		throw new Error(
			'The config format has changed. Change `Config.Rendering.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Output() {
		throw new Error(
			'The config format has changed. Change `Config.Output.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Log() {
		throw new Error(
			'The config format has changed. Change `Config.Log.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Preview() {
		throw new Error(
			'The config format has changed. Change `Config.Preview.*()` calls to `Config.*()` in your config file.',
		);
	},
	get Puppeteer() {
		throw new Error(
			'The config format has changed. Change `Config.Puppeteer.*()` calls to `Config.*()` in your config file.',
		);
	},
	setMaxTimelineTracks: StudioServerInternals.setMaxTimelineTracks,
	setKeyboardShortcutsEnabled,
	setNumberOfSharedAudioTags,
	setWebpackPollingInMilliseconds,
	setShouldOpenBrowser,
	setBufferStateDelayInMilliseconds,
	overrideWebpackConfig,
	setPort,
	setStudioPort,
	setRendererPort,
	setPublicDir: publicDirOption.setConfig,
	setEntryPoint,
	setLevel: logLevelOption.setConfig,
	setBrowserExecutable,
	setTimeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption.setConfig,
	setDelayRenderTimeoutInMilliseconds:
		delayRenderTimeoutInMillisecondsOption.setConfig,
	setChromiumDisableWebSecurity,
	setChromiumIgnoreCertificateErrors,
	setChromiumHeadlessMode: headlessOption.setConfig,
	setChromiumOpenGlRenderer: glOption.setConfig,
	setChromiumUserAgent,
	setDotEnvLocation,
	setConcurrency,
	setChromiumMultiProcessOnLinux: enableMultiprocessOnLinuxOption.setConfig,
	setQuality: () => {
		throw new Error(
			'setQuality() has been renamed - use setJpegQuality() instead.',
		);
	},
	setImageFormat: () => {
		throw new Error(
			'Config.setImageFormat() has been renamed - use Config.setVideoImageFormat() instead (default "jpeg"). For rendering stills, use Config.setStillImageFormat() (default "png")',
		);
	},
	setJpegQuality: jpegQualityOption.setConfig,
	setStillImageFormat,
	setVideoImageFormat,
	setMetadata,
	setEncodingMaxRate: encodingMaxRateOption.setConfig,
	setEncodingBufferSize: encodingBufferSizeOption.setConfig,
	setFrameRange,
	setScale: scaleOption.setConfig,
	setEveryNthFrame,
	setNumberOfGifLoops: numberOfGifLoopsOption.setConfig,
	setMuted: mutedOption.setConfig,
	setEnforceAudioTrack: enforceAudioOption.setConfig,
	setOutputLocation,
	setOverwriteOutput: overwriteOption.setConfig,
	setPixelFormat,
	setCodec: videoCodecOption.setConfig,
	setCrf: crfOption.setConfig,
	setImageSequence,
	setProResProfile,
	setX264Preset: x264Option.setConfig,
	setAudioBitrate: audioBitrateOption.setConfig,
	setVideoBitrate: videoBitrateOption.setConfig,
	setForSeamlessAacConcatenation: forSeamlessAacConcatenationOption.setConfig,
	overrideHeight,
	overrideWidth,
	overrideFfmpegCommand: setFfmpegOverrideFunction,
	setAudioCodec: audioCodecOption.setConfig,
	setOffthreadVideoCacheSizeInBytes: (size) => {
		offthreadVideoCacheSizeInBytesOption.setConfig(size);
	},
	setDeleteAfter: deleteAfterOption.setConfig,
	setColorSpace: colorSpaceOption.setConfig,
	setBeepOnFinish: beepOnFinishOption.setConfig,
	setEnableFolderExpiry: folderExpiryOption.setConfig,
	setRepro: reproOption.setConfig,
	setLambdaInsights: enableLambdaInsights.setConfig,
	setBinariesDirectory: binariesDirectoryOption.setConfig,
	setPreferLosslessAudio: preferLosslessOption.setConfig,
	setPublicPath: publicPathOption.setConfig,
};

export const ConfigInternals = {
	getRange,
	getBrowser,
	getPixelFormat,
	getProResProfile,
	getBrowserExecutable,
	getStudioPort,
	getRendererPortFromConfigFile,
	getRendererPortFromConfigFileAndCliFlag,
	getChromiumDisableWebSecurity,
	getIgnoreCertificateErrors,
	getEveryNthFrame,
	getConcurrency,
	getStillFrame,
	getShouldOutputImageSequence,
	getDotEnvLocation,
	getUserPreferredStillImageFormat,
	getUserPreferredVideoImageFormat,
	getWebpackOverrideFn,
	getOutputLocation,
	setFrameRangeFromCli,
	setStillFrame,
	getMaxTimelineTracks: StudioServerInternals.getMaxTimelineTracks,
	defaultOverrideFunction,
	getKeyboardShortcutsEnabled,
	getFfmpegOverrideFunction,
	getHeight,
	getWidth,
	getMetadata,
	getEntryPoint,
	getWebpackPolling,
	getShouldOpenBrowser,
	getChromiumUserAgent,
	getBufferStateDelayInMilliseconds,
	getOutputCodecOrUndefined: BrowserSafeApis.getOutputCodecOrUndefined,
};
