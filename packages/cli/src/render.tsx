import {bundle} from '@remotion/bundler';
import {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getCompositions,
	renderFrames,
	RenderFramesOutput,
	stitchFramesToVideo,
	validateFfmpeg,
} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Config, Internals} from 'remotion';
import {getFinalOutputCodec} from 'remotion/dist/config/codec';
import {getCompositionId} from './get-composition-id';
import {getConfigFileName} from './get-config-file-name';
import {getOutputFilename} from './get-filename';
import {getUserProps} from './get-user-props';
import {getImageFormat} from './image-formats';
import {loadConfigFile} from './load-config';
import {parseCommandLine} from './parse-command-line';
import {getUserPassedFileExtension} from './user-passed-output-location';

export const render = async () => {
	const args = process.argv;
	const file = args[3];
	const fullPath = path.join(process.cwd(), file);

	const cwd = process.cwd();
	const BUNDLE_DIST =
		process.env.BUNDLE_DIST && path.resolve(cwd, process.env.BUNDLE_DIST);
	const RENDER_DIST =
		process.env.RENDER_DIST && path.resolve(cwd, process.env.RENDER_DIST);
	const RENDER_FROM =
		process.env.RENDER_FROM && path.resolve(cwd, process.env.RENDER_FROM);
	const STITCH_FROM =
		process.env.STITCH_FROM && path.resolve(cwd, process.env.STITCH_FROM);

	const configFileName = getConfigFileName();
	loadConfigFile(configFileName);
	parseCommandLine();
	const parallelism = Internals.getConcurrency();
	const frameRange = Internals.getRange();
	if (typeof frameRange === 'number') {
		console.warn(
			'Selected a single frame. Assuming you want to output an image.'
		);
		console.warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`
		);
		console.warn(
			"To dismiss this message, add the '--sequence' flag explicitly."
		);
		Config.Output.setImageSequence(true);
	}
	const shouldOutputImageSequence = Internals.getShouldOutputImageSequence();
	const userCodec = Internals.getOutputCodecOrUndefined();
	if (shouldOutputImageSequence && userCodec) {
		console.error(
			'Detected both --codec and --sequence (formerly --png) flag.'
		);
		console.error(
			'This is an error - no video codec can be used for image sequences.'
		);
		console.error('Remove one of the two flags and try again.');
		process.exit(1);
	}
	const codec = getFinalOutputCodec({
		codec: userCodec,
		fileExtension: getUserPassedFileExtension(),
		emitWarning: true,
	});
	if (codec === 'vp8' && !(await ffmpegHasFeature('enable-libvpx'))) {
		console.log(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		console.log(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}
	if (codec === 'h265' && !(await ffmpegHasFeature('enable-gpl'))) {
		console.log(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		console.log(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
	if (codec === 'h265' && !(await ffmpegHasFeature('enable-libx265'))) {
		console.log(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		console.log(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	const outputFile = getOutputFilename(codec, shouldOutputImageSequence);
	const overwrite = Internals.getShouldOverwrite();
	const userProps = getUserProps();
	const quality = Internals.getQuality();
	const browser = Internals.getBrowser() ?? Internals.DEFAULT_BROWSER;

	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		console.log(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}
	if (!shouldOutputImageSequence) {
		await validateFfmpeg();
	}
	const crf = shouldOutputImageSequence ? null : Internals.getActualCrf(codec);
	if (crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}
	const pixelFormat = Internals.getPixelFormat();
	const imageFormat = getImageFormat(
		shouldOutputImageSequence ? undefined : codec
	);

	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	try {
		await ensureLocalBrowser(browser);
	} catch (err) {
		console.error('Could not download a browser for rendering frames.');
		console.error(err);
		process.exit(1);
	}
	if (shouldOutputImageSequence) {
		fs.mkdirSync(absoluteOutputFile, {
			recursive: true,
		});
	}
	const steps = shouldOutputImageSequence ? 2 : 3;
	process.stdout.write(`📦 (1/${steps}) Bundling video...\n`);

	const bundlingProgress = new cliProgress.Bar(
		{
			clearOnComplete: true,
			format: '[{bar}] {percentage}%',
		},
		cliProgress.Presets.shades_grey
	);

	bundlingProgress.start(100, 0);

	const bundled =
		RENDER_FROM ||
		(await bundle(
			fullPath,
			(progress) => {
				bundlingProgress.update(progress);
			},
			{outDir: BUNDLE_DIST}
		));
	bundlingProgress.stop();
	const comps = await getCompositions(
		bundled,
		Internals.getBrowser() ?? Internals.DEFAULT_BROWSER
	);
	const compositionId = getCompositionId(comps);

	const config = comps.find((c) => c.id === compositionId);
	if (!config) {
		throw new Error(`Cannot find composition with ID ${compositionId}`);
	}

	const outputDir = shouldOutputImageSequence
		? absoluteOutputFile
		: STITCH_FROM || (await prepareOutDir(RENDER_DIST));

	let rendered: RenderFramesOutput | null = null;

	if (!STITCH_FROM) {
		const renderProgress = new cliProgress.Bar(
			{
				clearOnComplete: true,
				etaBuffer: 50,
				format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
			},
			cliProgress.Presets.shades_grey
		);
		rendered = await renderFrames({
			config,
			onFrameUpdate: (frame) => renderProgress.update(frame),
			parallelism,
			compositionId,
			outputDir,
			onStart: ({frameCount}) => {
				process.stdout.write(
					`📼 (2/${steps}) Rendering frames (${getActualConcurrency(
						parallelism
					)}x concurrency)...\n`
				);
				renderProgress.start(frameCount, 0);
			},
			userProps,
			webpackBundle: bundled,
			imageFormat,
			quality,
			browser,
			frameRange: frameRange ?? null,
		});
		renderProgress.stop();
	}
	if (process.env.DEBUG) {
		Internals.perf.logPerf();
	}
	if (!shouldOutputImageSequence) {
		process.stdout.write(`🧵 (3/${steps}) Stitching frames together...\n`);
		if (typeof crf !== 'number') {
			throw TypeError('CRF is unexpectedly not a number');
		}
		const stitchingProgress = new cliProgress.Bar(
			{
				clearOnComplete: true,
				etaBuffer: 50,
				format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
			},
			cliProgress.Presets.shades_grey
		);
		stitchingProgress.start(rendered?.frameCount ?? config.durationInFrames, 0);
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
			crf,
			onProgress: (frame) => {
				stitchingProgress.update(frame);
			},
		});
		stitchingProgress.stop();

		console.log('Cleaning up...');
		try {
			await Promise.all(
				[
					!STITCH_FROM &&
						fs.promises.rmdir(outputDir, {
							recursive: true,
						}),
					!RENDER_FROM &&
						fs.promises.rmdir(bundled, {
							recursive: true,
						}),
				].filter(Boolean) as Promise<void>[]
			);
		} catch (err) {
			console.error('Could not clean up directory.');
			console.error(err);
			console.log('Do you have minimum required Node.js version?');
			process.exit(1);
		}
		console.log('\n▶️ Your video is ready - hit play!');
	} else {
		console.log('\n▶️ Your image sequence is ready!');
	}
	console.log(absoluteOutputFile);
};

const prepareOutDir = async (specified?: string) => {
	if (specified) {
		await fs.promises.mkdir(specified, {recursive: true});
		return specified;
	} else {
		return await fs.promises.mkdtemp(
			path.join(os.tmpdir(), 'react-motion-render')
		);
	}
};
