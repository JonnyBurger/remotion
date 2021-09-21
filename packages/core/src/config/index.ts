import {Browser} from './browser';
import {BrowserExecutable, setBrowserExecutable} from './browser-executable';
import {Codec, setCodec, setOutputFormat} from './codec';
import {Concurrency, setConcurrency} from './concurrency';
import {ConcurrentMode, setConcurrentMode} from './concurrent-mode';
import {setCrf} from './crf';
import {setDotEnvLocation} from './env-file';
import {FrameRange, setFrameRange} from './frame-range';
import {ImageFormat, setImageFormat} from './image-format';
import {setImageSequence} from './image-sequence';
import {LogLevel, setLogLevel} from './log';
import {setMaxTimelineTracks} from './max-timeline-tracks';
import {
	overrideWebpackConfig,
	WebpackConfiguration,
	WebpackOverrideFn,
} from './override-webpack';
import {setOverwriteOutput} from './overwrite';
import {setParallelEncoding} from './parallel-encoding';
import {PixelFormat, setPixelFormat} from './pixel-format';
import {setPort} from './preview-server';
import {setProResProfile} from './prores-profile';
import {setQuality} from './quality';
import {setWebpackCaching} from './webpack-caching';

export const Config = {
	Preview: {
		/**
		 * Change the maximum amount of tracks that are shown in the timeline.
		 * @param maxTracks The maximum amount of timeline tracks that you would like to show.
		 * @default 15
		 */
		setMaxTimelineTracks,
	},
	Bundling: {
		/**
		 * Pass in a function which takes the current Webpack config
		 * and return a modified Webpack configuration.
		 * Docs: http://remotion.dev/docs/webpack
		 */
		overrideWebpackConfig,
		/**
		 * Whether Webpack bundles should be cached to make
		 * subsequent renders faster. Default: true
		 */
		setCachingEnabled: setWebpackCaching,
		/**
		 * Define on which port Remotion should start it's HTTP servers during preview and rendering.
		 * By default, Remotion will try to find a free port.
		 * If you specify a port, but it's not available, Remotion will throw an error.
		 */
		setPort,
	},
	Log: {
		/**
		 * Set the log level.
		 * Acceptable values: 'error' | 'warning' | 'info' | 'verbose'
		 * Default value: 'info'
		 *
		 * Set this to 'verbose' to get browser logs and other IO.
		 */
		setLevel: setLogLevel,
	},
	Puppeteer: {
		/**
		 * Specify executable path for the browser to use.
		 * Default: null, which will make Remotion find or download a version of said browser.
		 */
		setBrowserExecutable,
	},
	Rendering: {
		/**
		 * Set a custom location for a .env file.
		 * Default: `.env`
		 */
		setDotEnvLocation,
		/**
		 * Sets how many Puppeteer instances will work on rendering your video in parallel.
		 * Default: `null`, meaning half of the threads available on your CPU.
		 */
		setConcurrency,
		/**
		 * Set the JPEG quality for the frames.
		 * Must be between 0 and 100.
		 * Must be between 0 and 100.
		 * Default: 80
		 */
		setQuality,
		/** Decide in which image format to render. Can be either 'jpeg' or 'png'.
		 * PNG is slower, but supports transparency.
		 */
		setImageFormat,
		/**
		 * Render only a subset of a video.
		 * Pass in a tuple [20, 30] to only render frames 20-30 into a video.
		 * Pass in a single number `20` to only render a single frame as an image.
		 * The frame count starts at 0.
		 */
		setFrameRange,

		/**
		 * Set the concurrent mode.
		 * Pass in 'tab' and the renderer will launch a single browser and pages will be opened in multiple tabs.
		 * Pass in 'browser' and the renderer will launch multiple browsers and open one page in each browser.
		 * Use 'browser' to maximize CPU utilization and render faster.
		 */
		setConcurrentMode,

		/**
		 * Enabling parallel encoding means render frames and encode video at the same time.
		 * The image will be passed directly into ffmpeg.
		 */
		setParallelEncoding,
	},
	Output: {
		/**
		 * If the video file already exists, should Remotion overwrite
		 * the output? Default: true
		 */
		setOverwriteOutput,
		/**
		 * Sets the pixel format in FFMPEG.
		 * See https://trac.ffmpeg.org/wiki/Chroma%20Subsampling for an explanation.
		 * You can override this using the `--pixel-format` Cli flag.
		 */
		setPixelFormat,
		/**
		 * @deprecated Use setCodec() and setImageSequence() instead.
		 * Specify what kind of output you, either `mp4` or `png-sequence`.
		 */
		setOutputFormat,
		/**
		 * Specify the codec for stitching the frames into a video.
		 * Can be `h264` (default), `h265`, `vp8` or `vp9`
		 */
		setCodec,
		/**
		 * Set the Constant Rate Factor to pass to FFMPEG.
		 * Lower values mean better quality, but be aware that the ranges of
		 * possible values greatly differs between codecs.
		 */
		setCrf,
		/**
		 * Set to true if don't want a video but an image sequence as the output.
		 */
		setImageSequence,
		/**
		 * Set the ProRes profile.
		 * This method is only valid if the codec has been set to 'prores'.
		 * Possible values: 4444-xq, 4444, hq, standard, light, proxy. Default: 'hq'
		 * See https://avpres.net/FFmpeg/im_ProRes.html for meaning of possible values.
		 */
		setProResProfile,
	},
} as const;

export type {
	PixelFormat,
	Concurrency,
	WebpackConfiguration,
	WebpackOverrideFn,
	BrowserExecutable,
	ImageFormat,
	Codec,
	Browser,
	FrameRange,
	LogLevel,
	ConcurrentMode,
};
