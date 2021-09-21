import {
	getCompositions,
	OnErrorInfo,
	OnStartData,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import {getActualConcurrency} from '@remotion/renderer/dist/get-concurrency';
import {spawnFfmpeg} from '@remotion/renderer/dist/stitcher';
import chalk from 'chalk';
import {ExecaChildProcess} from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';
import {getCliOptions} from './get-cli-options';
import {getCompositionId} from './get-composition-id';
import {handleCommonError} from './handle-common-errors';
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	createProgressBar,
	makeRenderingProgress,
	makeStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import {getUserPassedFileExtension} from './user-passed-output-location';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

const onError = async (info: OnErrorInfo) => {
	Log.error();
	if (info.frame === null) {
		Log.error(
			'The following error occured when trying to initialize the video rendering:'
		);
	} else {
		Log.error(
			`The following error occurred when trying to render frame ${info.frame}:`
		);
	}

	handleCommonError(info.error);

	process.exit(1);
};

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	const fullPath = path.join(process.cwd(), file);

	initializeRenderCli('sequence');

	const {
		codec,
		proResProfile,
		parallelism,
		concurrentMode,
		parallelEncoding,
		frameRange,
		shouldOutputImageSequence,
		absoluteOutputFile,
		overwrite,
		inputProps,
		envVariables,
		quality,
		browser,
		crf,
		pixelFormat,
		imageFormat,
		browserExecutable,
	} = await getCliOptions('series');

	await checkAndValidateFfmpegVersion();

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const browserInstance = Promise.all(
		new Array(concurrentMode === 'browser' ? actualParallelism : 1)
			.fill(true)
			.map(() =>
				RenderInternals.openBrowser(browser, {
					browserExecutable,
					shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
				})
			)
	);
	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}

	const steps = shouldOutputImageSequence ? 2 : 3;

	const bundled = await bundleOnCli(fullPath, steps);

	const openedBrowser = await browserInstance;
	const comps = await getCompositions(bundled, {
		browser,
		inputProps,
		browserInstance: openedBrowser[0],
		envVariables,
	});
	const compositionId = getCompositionId(comps);

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	RenderInternals.validateEvenDimensionsWithCodec({
		width: config.width,
		height: config.height,
		codec,
	});

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verbose('Output dir', outputDir);

	const renderProgress = createProgressBar();
	let totalFrames = 0;
	const renderStart = Date.now();

	let stitcherFfmpeg: ExecaChildProcess<string> | undefined;
	let preStitcher;
	let encodedFrames: number | undefined;
	let renderedFrames: number;
	let preEncodedFileLocation: string | undefined;
	const updateRenderProgress = () =>
		renderProgress.update(
			makeRenderingProgress({
				frames: renderedFrames || 0,
				encodedFrames,
				totalFrames,
				concurrency: RenderInternals.getActualConcurrency(parallelism),
				doneIn: null,
				steps,
			})
		);
	if (parallelEncoding) {
		if (typeof crf !== 'number') {
			throw new TypeError('CRF is unexpectedly not a number');
		}

		preEncodedFileLocation = path.join(
			outputDir,
			'pre-encode.' + getUserPassedFileExtension()
		);

		preStitcher = await spawnFfmpeg({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: preEncodedFileLocation,
			force: true,
			imageFormat,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			parallelism,
			onProgress: (frame: number) => {
				encodedFrames = frame;
				updateRenderProgress();
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
			parallelEncoding,
			assetsInfo: {assets: [], bundleDir: bundled},
		});
		stitcherFfmpeg = preStitcher.task;
	}

	const renderer = renderFrames({
		config,
		onFrameUpdate: (frame: number) => {
			renderedFrames = frame;
			updateRenderProgress();
		},
		parallelism,
		concurrentMode,
		parallelEncoding,
		compositionId,
		outputDir,
		onError,
		onStart: ({frameCount: fc}: OnStartData) => {
			renderedFrames = 0;
			if (parallelEncoding) encodedFrames = 0;
			totalFrames = fc;
			updateRenderProgress();
		},
		inputProps,
		envVariables,
		webpackBundle: bundled,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		puppeteerInstance: openedBrowser,
		writeFrame: async (buffer) => {
			stitcherFfmpeg?.stdin?.write(buffer);
		},
	});
	const {assetsInfo} = await renderer;
	if (stitcherFfmpeg) {
		stitcherFfmpeg?.stdin?.end();
		await stitcherFfmpeg;
		preStitcher?.cleanup?.();
	}

	const closeBrowserPromise = openedBrowser.map((o) => o.close());
	renderProgress.update(
		makeRenderingProgress({
			frames: totalFrames,
			encodedFrames: parallelEncoding ? totalFrames : undefined,
			totalFrames,
			steps,
			concurrency: RenderInternals.getActualConcurrency(parallelism),
			doneIn: Date.now() - renderStart,
		}) + '\n'
	);
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}

	if (shouldOutputImageSequence) {
		Log.info(chalk.green('\nYour image sequence is ready!'));
	} else {
		if (typeof crf !== 'number') {
			throw new TypeError('CRF is unexpectedly not a number');
		}

		const stitchingProgress = createProgressBar();

		stitchingProgress.update(
			makeStitchingProgress({
				doneIn: null,
				frames: 0,
				steps,
				totalFrames,
				parallelEncoding,
			})
		);
		const stitchStart = Date.now();
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
			preEncodedFileLocation,
			force: overwrite,
			imageFormat,
			pixelFormat,
			codec,
			proResProfile,
			crf,
			assetsInfo,
			parallelism,
			onProgress: (frame: number) => {
				stitchingProgress.update(
					makeStitchingProgress({
						doneIn: null,
						frames: frame,
						steps,
						totalFrames,
						parallelEncoding,
					})
				);
			},
			onDownload: (src: string) => {
				Log.info('Downloading asset... ', src);
			},
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
		stitchingProgress.update(
			makeStitchingProgress({
				doneIn: Date.now() - stitchStart,
				frames: totalFrames,
				steps,
				totalFrames,
				parallelEncoding,
			}) + '\n'
		);

		Log.verbose('Cleaning up...');
		try {
			await Promise.all([
				(fs.promises.rm ?? fs.promises.rmdir)(outputDir, {
					recursive: true,
				}),
				(fs.promises.rm ?? fs.promises.rmdir)(bundled, {
					recursive: true,
				}),
			]);
		} catch (err) {
			Log.warn('Could not clean up directory.');
			Log.warn(err);
			Log.warn('Do you have minimum required Node.js version?');
		}

		Log.info(chalk.green('\nYour video is ready!'));
	}

	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.info('-', 'Output can be found at:');
	Log.info(chalk.cyan(`▶️ ${absoluteOutputFile}`));
	await closeBrowserPromise;
};
