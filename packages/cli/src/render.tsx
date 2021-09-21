import {
	getCompositions,
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
import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	createProgressBar,
	makeRenderingProgress,
	makeStitchingProgress,
} from './progress-bar';
import {bundleOnCli} from './setup-cache';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

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
	} = await getCliOptions('series');

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

	const openedBrowser = await browserInstance;
	const comps = await getCompositions(bundled, {
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

	Log.verbose('Output dir', outputDir);

	const renderProgress = createProgressBar();
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
		webpackBundle: bundled,
		imageFormat,
		quality,
		browser,
		frameRange: frameRange ?? null,
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel('verbose'),
		puppeteerInstance: openedBrowser,
	});

	const closeBrowserPromise = openedBrowser.close();
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

		const stitchingProgress = createProgressBar();

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
