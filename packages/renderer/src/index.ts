import execa from 'execa';
import mime from 'mime-types';
import {downloadFile} from './assets/download-file';
import {deleteDirectory} from './delete-directory';
import {ensureOutputDirectory} from './ensure-output-directory';
import {symbolicateError} from './error-handling/symbolicate-error';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {
	ffmpegHasFeature,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {getDurationFromFrameRange} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {getDesiredPort} from './get-port';
import {isServeUrl} from './is-serve-url';
import {normalizeServeUrl} from './normalize-serve-url';
import {killAllBrowsers} from './open-browser';
import {parseStack} from './parse-browser-error-stack';
import {isPathInside} from './serve-handler/is-path-inside';
import {serveStatic} from './serve-static';
import {spawnFfmpeg} from './stitch-frames-to-video';
import {tmpDir} from './tmp-dir';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';
import {validateScale} from './validate-scale';
export type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
export {BrowserLog} from './browser-log';
export {combineVideos} from './combine-videos';
export {ErrorWithStackFrame} from './error-handling/handle-javascript-exception';
export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {CancelSignal, makeCancelSignal} from './make-cancel-signal';
export {openBrowser} from './open-browser';
export type {ChromiumOptions} from './open-browser';
export {renderFrames} from './render-frames';
export {
	renderMedia,
	RenderMediaOnProgress,
	RenderMediaOptions,
	StitchingState,
} from './render-media';
export {renderStill} from './render-still';
export {StitcherOptions, stitchFramesToVideo} from './stitch-frames-to-video';
export {SymbolicatedStackFrame} from './symbolicate-stacktrace';
export {OnStartData, RenderFramesOutput} from './types';

export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getFfmpegVersion,
	validateFfmpeg,
	binaryExists,
	getFfmpegBuildInfo,
	serveStatic,
	validateEvenDimensionsWithCodec,
	normalizeServeUrl,
	spawnFfmpeg,
	getFileExtensionFromCodec,
	tmpDir,
	deleteDirectory,
	isServeUrl,
	ensureOutputDirectory,
	getRealFrameRange,
	validatePuppeteerTimeout,
	downloadFile,
	validateScale,
	killAllBrowsers,
	parseStack,
	symbolicateError,
	SymbolicateableError,
	getDurationFromFrameRange,
	getExtensionOfFilename,
	getDesiredPort,
	mime,
	isPathInside,
	execa,
};
