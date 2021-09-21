import {
	getCompositions,
	OnErrorInfo,
	OnStartData,
	renderFrames,
	RenderInternals,
	stitchFramesToVideo,
} from '@remotion/renderer';
import chalk from 'chalk';
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
	createOverwriteableCliOutput,
	makeRenderingProgress,
	makeStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
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
	} = await getCliOptions({isLambda: false, type: 'series'});

	if (!absoluteOutputFile) {
		throw new Error(
			'assertion error - expected absoluteOutputFile to not be null'
		);
	}

	await checkAndValidateFfmpegVersion();

	const browserInstance = RenderInternals.openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
	});

	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}

	const steps = shouldOutputImageSequence ? 2 : 3;

	const bundled = await bundleOnCli(fullPath, steps);

	const {port, close} = await RenderInternals.serveStatic(bundled);

	const serveUrl = `http://localhost:${port}`;

	const openedBrowser = await browserInstance;
	let i = 0;

	// Cycle through the browser and focus each tabs to activate contexts
	// like Mapbox GL.
	// TODO: Move this out of the Lambda branch
	const interval = setInterval(() => {
		openedBrowser
			.pages()
			.then((pages) => {
				const currentPage = pages[i % pages.length];
				i++;
				if (!currentPage.isClosed()) {
					currentPage.bringToFront();
				}
			})
			.catch((err) => Log.error(err));
	}, 100);
	const comps = await getCompositions(serveUrl, {
		browser,
		inputProps,
		browserInstance: openedBrowser,
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

	if (!outputDir) {
		throw new Error('Assertion error: Expected outputDir to not be null');
	}

	Log.verbose('Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput();
	let totalFrames = 0;
	const renderStart = Date.now();
	const {assetsInfo} = await renderFrames({
		config,
		onFrameUpdate: (frame: number) => {
			renderProgress.update(
				makeRenderingProgress({
					frames: frame,
					totalFrames,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: null,
					steps,
				})
			);
		},
		parallelism,
		compositionId,
		outputDir,
		onError,
		onStart: ({frameCount: fc}: OnStartData) => {
			renderProgress.update(
				makeRenderingProgress({
					frames: 0,
					totalFrames: fc,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: null,
					steps,
				})
			);
			totalFrames = fc;
		},
		inputProps,
		envVariables,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		puppeteerInstance: openedBrowser,
		serveUrl,
	});

	const closeBrowserPromise = openedBrowser.close();
	clearInterval(interval);
	renderProgress.update(
		makeRenderingProgress({
			frames: totalFrames,
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

		const stitchingProgress = createOverwriteableCliOutput();

		stitchingProgress.update(
			makeStitchingProgress({
				doneIn: null,
				frames: 0,
				steps,
				totalFrames,
			})
		);
		const stitchStart = Date.now();
		await stitchFramesToVideo({
			dir: outputDir,
			width: config.width,
			height: config.height,
			fps: config.fps,
			outputLocation: absoluteOutputFile,
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
					})
				);
			},
			onDownload: (src: string) => {
				Log.info('Downloading asset... ', src);
			},
			webpackBundle: bundled,
			verbose: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		});
		stitchingProgress.update(
			makeStitchingProgress({
				doneIn: Date.now() - stitchStart,
				frames: totalFrames,
				steps,
				totalFrames,
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
				close(),
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
