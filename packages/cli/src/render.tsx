import {
	getCompositions,
	openBrowser,
	renderFrames,
	RenderInternals,
	renderMedia,
	RenderMediaOnDownload,
	StitchingState,
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
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {prepareEntryPoint} from './prepare-entry-point';
import {
	createOverwriteableCliOutput,
	DownloadProgress,
	makeRenderingAndStitchingProgress,
} from './progress-bar';
import {RenderStep} from './step';
import {checkAndValidateFfmpegVersion} from './validate-ffmpeg-version';

export const render = async () => {
	const startTime = Date.now();
	const file = parsedCli._[1];
	if (!file) {
		Log.error('No entry point specified. Pass more arguments:');
		Log.error(
			'   npx remotion render [entry-point] [composition-name] [out-name]'
		);
		Log.error('Documentation: https://www.remotion.dev/docs/render');
		process.exit(1);
	}

	await initializeRenderCli('sequence');

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
		ffmpegExecutable,
		ffprobeExecutable,
		scale,
		chromiumOptions,
		port,
		puppeteerTimeout,
	} = await getCliOptions({isLambda: false, type: 'series'});

	if (!absoluteOutputFile) {
		throw new Error(
			'assertion error - expected absoluteOutputFile to not be null'
		);
	}

	Log.verbose('Browser executable: ', browserExecutable);

	await checkAndValidateFfmpegVersion({
		ffmpegExecutable,
	});

	const browserInstance = openBrowser(browser, {
		browserExecutable,
		shouldDumpIo: Internals.Logging.isEqualOrBelowLogLevel(
			Internals.Logging.getLogLevel(),
			'verbose'
		),
		chromiumOptions,
		forceDeviceScaleFactor: scale,
	});

	const otherSteps: RenderStep[] = [
		'rendering' as const,
		shouldOutputImageSequence ? null : ('stitching' as const),
	].filter(Internals.truthy);

	const {urlOrBundle, steps, shouldDelete} = await prepareEntryPoint(
		file,
		otherSteps
	);

	const onDownload: RenderMediaOnDownload = (src) => {
		const id = Math.random();
		const download: DownloadProgress = {
			id,
			name: src,
			progress: 0,
		};
		downloads.push(download);
		updateRenderProgress();

		return ({percent}) => {
			download.progress = percent;
			updateRenderProgress();
		};
	};

	const puppeteerInstance = await browserInstance;

	const comps = await getCompositions(urlOrBundle, {
		inputProps,
		puppeteerInstance,
		envVariables,
		timeoutInMilliseconds: Internals.getCurrentPuppeteerTimeout(),
		chromiumOptions,
		browserExecutable,
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
		scale,
	});

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: await fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-render'));

	Log.verbose('Output dir', outputDir);

	const renderProgress = createOverwriteableCliOutput(quietFlagProvided());
	let totalFrames: number | null = RenderInternals.getDurationFromFrameRange(
		frameRange,
		config.durationInFrames
	);
	let encodedFrames = 0;
	let renderedFrames = 0;
	let encodedDoneIn: number | null = null;
	let renderedDoneIn: number | null = null;
	let stitchStage: StitchingState = 'encoding';
	const downloads: DownloadProgress[] = [];

	const updateRenderProgress = () => {
		if (totalFrames === null) {
			throw new Error('totalFrames should not be 0');
		}

		return renderProgress.update(
			makeRenderingAndStitchingProgress({
				rendering: {
					frames: renderedFrames,
					totalFrames,
					concurrency: RenderInternals.getActualConcurrency(parallelism),
					doneIn: renderedDoneIn,
					steps,
				},
				stitching: shouldOutputImageSequence
					? null
					: {
							doneIn: encodedDoneIn,
							frames: encodedFrames,
							stage: stitchStage,
							steps,
							totalFrames,
					  },
				downloads,
			})
		);
	};

	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
		if (imageFormat === 'none') {
			Log.error(
				'Cannot render an image sequence with a codec that renders no images.'
			);
			Log.error(`codec = ${codec}, imageFormat = ${imageFormat}`);
			process.exit(1);
		}

		await renderFrames({
			config,
			imageFormat,
			inputProps,
			onFrameUpdate: (rendered) => {
				renderedFrames = rendered;
				updateRenderProgress();
			},
			onStart: ({frameCount}) => {
				totalFrames = frameCount;
				return updateRenderProgress();
			},
			onDownload: (src: string) => {
				if (src.startsWith('data:')) {
					Log.info(
						'\nWriting Data URL to file: ',
						src.substring(0, 30) + '...'
					);
				} else {
					Log.info('\nDownloading asset... ', src);
				}
			},
			outputDir,
			serveUrl: urlOrBundle,
			dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'verbose'
			),
			envVariables,
			frameRange,
			parallelism,
			puppeteerInstance,
			quality,
			timeoutInMilliseconds: puppeteerTimeout,
			chromiumOptions,
			scale,
			ffmpegExecutable,
			ffprobeExecutable,
			browserExecutable,
			port,
		});
		renderedDoneIn = Date.now() - startTime;

		updateRenderProgress();
		Log.info();
		Log.info();
		Log.info(chalk.green('\nYour image sequence is ready!'));
		return;
	}

	await renderMedia({
		outputLocation: absoluteOutputFile,
		codec,
		composition: config,
		crf,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		frameRange,
		imageFormat,
		inputProps,
		onProgress: (update) => {
			encodedDoneIn = update.encodedDoneIn;
			encodedFrames = update.encodedFrames;
			renderedDoneIn = update.renderedDoneIn;
			stitchStage = update.stitchStage;
			renderedFrames = update.renderedFrames;
			updateRenderProgress();
		},
		puppeteerInstance,
		overwrite,
		parallelism,
		pixelFormat,
		proResProfile,
		quality,
		serveUrl: urlOrBundle,
		onDownload,
		dumpBrowserLogs: Internals.Logging.isEqualOrBelowLogLevel(
			Internals.Logging.getLogLevel(),
			'verbose'
		),
		onStart: ({frameCount}) => {
			totalFrames = frameCount;
		},
		chromiumOptions,
		timeoutInMilliseconds: Internals.getCurrentPuppeteerTimeout(),
		scale,
		port,
	});

	Log.info();
	Log.info();
	const seconds = Math.round((Date.now() - startTime) / 1000);
	Log.info(
		[
			'- Total render time:',
			seconds,
			seconds === 1 ? 'second' : 'seconds',
		].join(' ')
	);
	Log.info('-', 'Output can be found at:');
	Log.info(chalk.cyan(`▶ ${absoluteOutputFile}`));
	Log.verbose('Cleaning up...');

	if (shouldDelete) {
		try {
			await RenderInternals.deleteDirectory(urlOrBundle);
		} catch (err) {
			Log.warn('Could not clean up directory.');
			Log.warn(err);
			Log.warn('Do you have minimum required Node.js version?');
		}
	}

	Log.info(chalk.green('\nYour video is ready!'));

	if (
		Internals.Logging.isEqualOrBelowLogLevel(
			Internals.Logging.getLogLevel(),
			'verbose'
		)
	) {
		Internals.perf.logPerf();
	}
};
