import type {ExecaChildProcess} from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type {SmallTCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {BrowserExecutable} from './browser-executable';
import type {BrowserLog} from './browser-log';
import type {Browser as PuppeteerBrowser} from './browser/Browser';
import {canUseParallelEncoding} from './can-use-parallel-encoding';
import type {Codec} from './codec';
import {codecSupportsMedia} from './codec-supports-media';
import {validateSelectedCrfAndCodecCombination} from './crf';
import {deleteDirectory} from './delete-directory';
import {ensureFramesInOrder} from './ensure-frames-in-order';
import {ensureOutputDirectory} from './ensure-output-directory';
import type {FfmpegExecutable} from './ffmpeg-executable';
import type {FrameRange} from './frame-range';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getRealFrameRange} from './get-frame-to-render';
import type {ImageFormat} from './image-format';
import {isAudioCodec} from './is-audio-codec';
import type {ServeUrlOrWebpackBundle} from './legacy-webpack-config';
import {getServeUrlWithFallback} from './legacy-webpack-config';
import type {CancelSignal} from './make-cancel-signal';
import {makeCancelSignal} from './make-cancel-signal';
import type {ChromiumOptions} from './open-browser';
import {DEFAULT_OVERWRITE} from './overwrite';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import type {PixelFormat} from './pixel-format';
import {prespawnFfmpeg} from './prespawn-ffmpeg';
import {shouldUseParallelEncoding} from './prestitcher-memory-usage';
import type {ProResProfile} from './prores-profile';
import {validateQuality} from './quality';
import {renderFrames} from './render-frames';
import {stitchFramesToVideo} from './stitch-frames-to-video';
import type {OnStartData} from './types';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateOutputFilename} from './validate-output-filename';
import {validateScale} from './validate-scale';

export type StitchingState = 'encoding' | 'muxing';

export type RenderMediaOnProgress = (progress: {
	renderedFrames: number;
	encodedFrames: number;
	encodedDoneIn: number | null;
	renderedDoneIn: number | null;
	stitchStage: StitchingState;
}) => void;

export type RenderMediaOptions = {
	outputLocation?: string | null;
	codec: Codec;
	composition: SmallTCompMetadata;
	inputProps?: unknown;
	parallelism?: number | null;
	crf?: number | null;
	imageFormat?: 'png' | 'jpeg' | 'none';
	ffmpegExecutable?: FfmpegExecutable;
	ffprobeExecutable?: FfmpegExecutable;
	pixelFormat?: PixelFormat;
	envVariables?: Record<string, string>;
	quality?: number;
	frameRange?: FrameRange | null;
	everyNthFrame?: number;
	numberOfGifLoops?: number | null;
	puppeteerInstance?: PuppeteerBrowser;
	overwrite?: boolean;
	onProgress?: RenderMediaOnProgress;
	onDownload?: RenderMediaOnDownload;
	proResProfile?: ProResProfile;
	dumpBrowserLogs?: boolean;
	onBrowserLog?: ((log: BrowserLog) => void) | undefined;
	onStart?: (data: OnStartData) => void;
	timeoutInMilliseconds?: number;
	chromiumOptions?: ChromiumOptions;
	scale?: number;
	port?: number | null;
	cancelSignal?: CancelSignal;
	browserExecutable?: BrowserExecutable;
	verbose?: boolean;
	/**
	 * @deprecated Only for Remotion internal usage
	 */
	downloadMap?: DownloadMap;
	muted?: boolean;
	enforceAudioTrack?: boolean;
} & ServeUrlOrWebpackBundle;

type Await<T> = T extends PromiseLike<infer U> ? U : T;

/**
 *
 * @description Render a video from a composition
 * @link https://www.remotion.dev/docs/renderer/render-media
 */
export const renderMedia = ({
	parallelism,
	proResProfile,
	crf,
	composition,
	ffmpegExecutable,
	ffprobeExecutable,
	inputProps,
	pixelFormat,
	codec,
	envVariables,
	frameRange,
	puppeteerInstance,
	outputLocation,
	onProgress,
	overwrite,
	onDownload,
	dumpBrowserLogs,
	onBrowserLog,
	onStart,
	timeoutInMilliseconds,
	chromiumOptions,
	scale,
	browserExecutable,
	port,
	cancelSignal,
	muted,
	enforceAudioTrack,
	...options
}: RenderMediaOptions): Promise<Buffer | null> => {
	validateQuality(options.quality);
	if (typeof crf !== 'undefined' && crf !== null) {
		validateSelectedCrfAndCodecCombination(crf, codec);
	}

	if (outputLocation) {
		validateOutputFilename(codec, getExtensionOfFilename(outputLocation));
	}

	const absoluteOutputLocation = outputLocation
		? path.resolve(process.cwd(), outputLocation)
		: null;

	validateScale(scale);

	const everyNthFrame = options.everyNthFrame ?? 1;
	const numberOfGifLoops = options.numberOfGifLoops ?? null;
	const serveUrl = getServeUrlWithFallback(options);

	let stitchStage: StitchingState = 'encoding';
	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher: Await<ReturnType<typeof prespawnFfmpeg>> | null = null;
	let encodedFrames = 0;
	let renderedFrames = 0;
	let renderedDoneIn: number | null = null;
	let encodedDoneIn: number | null = null;
	let cancelled = false;

	const renderStart = Date.now();
	const downloadMap = options.downloadMap ?? makeDownloadMap();
	const {estimatedUsage, freeMemory, hasEnoughMemory} =
		shouldUseParallelEncoding({
			height: composition.height,
			width: composition.width,
		});
	const parallelEncoding = hasEnoughMemory && canUseParallelEncoding(codec);

	if (options.verbose) {
		console.log(
			'[PRESTITCHER] Free memory:',
			freeMemory,
			'Estimated usage parallel encoding',
			estimatedUsage
		);
		console.log(
			'[PRESTICHER]: Codec supports parallel rendering:',
			canUseParallelEncoding(codec)
		);
		if (parallelEncoding) {
			console.log('[PRESTICHER] Parallel encoding is enabled.');
		} else {
			console.log('[PRESTITCHER] Parallel encoding is disabled.');
		}
	}

	const imageFormat: ImageFormat = isAudioCodec(codec)
		? 'none'
		: options.imageFormat ?? 'jpeg';
	const quality = imageFormat === 'jpeg' ? options.quality : undefined;

	const preEncodedFileLocation = parallelEncoding
		? path.join(
				downloadMap.preEncode,
				'pre-encode.' + getFileExtensionFromCodec(codec, 'chunk')
		  )
		: null;

	const outputDir = parallelEncoding
		? null
		: fs.mkdtempSync(path.join(os.tmpdir(), 'react-motion-render'));

	validateEvenDimensionsWithCodec({
		codec,
		height: composition.height,
		scale: scale ?? 1,
		width: composition.width,
	});

	const callUpdate = () => {
		onProgress?.({
			encodedDoneIn,
			encodedFrames,
			renderedDoneIn,
			renderedFrames,
			stitchStage,
		});
	};

	const realFrameRange = getRealFrameRange(
		composition.durationInFrames,
		frameRange ?? null
	);

	const cancelRenderFrames = makeCancelSignal();
	const cancelPrestitcher = makeCancelSignal();
	const cancelStitcher = makeCancelSignal();

	cancelSignal?.(() => {
		cancelRenderFrames.cancel();
	});

	const {waitForRightTimeOfFrameToBeInserted, setFrameToStitch, waitForFinish} =
		ensureFramesInOrder(realFrameRange);

	const fps = composition.fps / (everyNthFrame ?? 1);
	Internals.validateFps(fps, 'in "renderMedia()"', codec === 'gif');

	const createPrestitcherIfNecessary = async () => {
		if (preEncodedFileLocation) {
			preStitcher = await prespawnFfmpeg({
				width: composition.width * (scale ?? 1),
				height: composition.height * (scale ?? 1),
				fps,
				outputLocation: preEncodedFileLocation,
				pixelFormat,
				codec,
				proResProfile,
				crf,
				onProgress: (frame: number) => {
					encodedFrames = frame;
					callUpdate();
				},
				verbose: options.verbose ?? false,
				ffmpegExecutable,
				imageFormat,
				signal: cancelPrestitcher.cancelSignal,
			});
			stitcherFfmpeg = preStitcher.task;
		}
	};

	const waitForPrestitcherIfNecessary = async () => {
		if (stitcherFfmpeg) {
			await waitForFinish();
			stitcherFfmpeg?.stdin?.end();
			try {
				await stitcherFfmpeg;
			} catch (err) {
				throw new Error(preStitcher?.getLogs());
			}
		}
	};

	const mediaSupport = codecSupportsMedia(codec);
	const disableAudio = !mediaSupport.audio || muted;

	const happyPath = createPrestitcherIfNecessary()
		.then(() => {
			const renderFramesProc = renderFrames({
				config: composition,
				onFrameUpdate: (frame: number) => {
					renderedFrames = frame;
					callUpdate();
				},
				parallelism,
				outputDir,
				onStart: (data) => {
					renderedFrames = 0;
					callUpdate();
					onStart?.(data);
				},
				inputProps,
				envVariables,
				imageFormat,
				quality,
				frameRange: frameRange ?? null,
				puppeteerInstance,
				everyNthFrame,
				onFrameBuffer: parallelEncoding
					? async (buffer, frame) => {
							await waitForRightTimeOfFrameToBeInserted(frame);
							if (cancelled) {
								return;
							}

							const id = startPerfMeasure('piping');
							stitcherFfmpeg?.stdin?.write(buffer);
							stopPerfMeasure(id);

							setFrameToStitch(
								Math.min(realFrameRange[1] + 1, frame + everyNthFrame)
							);
					  }
					: undefined,
				serveUrl,
				dumpBrowserLogs,
				onBrowserLog,
				onDownload,
				timeoutInMilliseconds,
				chromiumOptions,
				scale,
				ffmpegExecutable,
				ffprobeExecutable,
				browserExecutable,
				port,
				cancelSignal: cancelRenderFrames.cancelSignal,
				downloadMap,
				muted: disableAudio,
			});

			return renderFramesProc;
		})
		.then((renderFramesReturn) => {
			return Promise.all([renderFramesReturn, waitForPrestitcherIfNecessary()]);
		})
		.then(([{assetsInfo}]) => {
			renderedDoneIn = Date.now() - renderStart;
			callUpdate();

			if (absoluteOutputLocation) {
				ensureOutputDirectory(absoluteOutputLocation);
			}

			const stitchStart = Date.now();
			return Promise.all([
				stitchFramesToVideo({
					width: composition.width * (scale ?? 1),
					height: composition.height * (scale ?? 1),
					fps,
					outputLocation: absoluteOutputLocation,
					internalOptions: {
						preEncodedFileLocation,
						imageFormat,
					},
					force: overwrite ?? DEFAULT_OVERWRITE,
					pixelFormat,
					codec,
					proResProfile,
					crf,
					assetsInfo,
					ffmpegExecutable,
					ffprobeExecutable,
					onProgress: (frame: number) => {
						stitchStage = 'muxing';
						encodedFrames = frame;
						callUpdate();
					},
					onDownload,
					numberOfGifLoops,
					verbose: options.verbose,
					dir: outputDir ?? undefined,
					cancelSignal: cancelStitcher.cancelSignal,
					muted: disableAudio,
					enforceAudioTrack,
				}),
				stitchStart,
			]);
		})
		.then(([buffer, stitchStart]) => {
			encodedFrames = getFramesToRender(realFrameRange, everyNthFrame).length;
			encodedDoneIn = Date.now() - stitchStart;
			callUpdate();
			return buffer;
		})
		.catch((err) => {
			/**
			 * When an error is thrown in renderFrames(...) (e.g., when delayRender() is used incorrectly), fs.unlinkSync(...) throws an error that the file is locked because ffmpeg is still running, and renderMedia returns it.
			 * Therefore we first kill the FFMPEG process before deleting the file
			 */
			cancelled = true;
			cancelRenderFrames.cancel();
			cancelStitcher.cancel();
			cancelPrestitcher.cancel();
			if (stitcherFfmpeg !== undefined && stitcherFfmpeg.exitCode === null) {
				const promise = new Promise<void>((resolve) => {
					setTimeout(() => {
						resolve();
					}, 2000);
					(stitcherFfmpeg as ExecaChildProcess<string>).on('close', resolve);
				});
				stitcherFfmpeg.kill();
				return promise.then(() => {
					throw err;
				});
			}

			throw err;
		})
		.finally(() => {
			if (
				preEncodedFileLocation !== null &&
				fs.existsSync(preEncodedFileLocation)
			) {
				deleteDirectory(path.dirname(preEncodedFileLocation));
			}

			// Clean download map if it was not passed in
			if (!options?.downloadMap) {
				cleanDownloadMap(downloadMap);
			}
		});

	return Promise.race([
		happyPath,
		new Promise<Buffer | null>((_resolve, reject) => {
			cancelSignal?.(() => {
				reject(new Error('renderMedia() got cancelled'));
			});
		}),
	]);
};
