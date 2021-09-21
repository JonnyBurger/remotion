import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {
	BrowserExecutable,
	Codec,
	FrameRange,
	Internals,
	PixelFormat,
} from 'remotion';
import {getEnvironmentVariables} from './get-env';
import {getOutputFilename} from './get-filename';
import {getInputProps} from './get-input-props';
import {getImageFormat} from './image-formats';
import {Log} from './log';
import {getUserPassedFileExtension} from './user-passed-output-location';

const getAndValidateFrameRange = () => {
	const frameRange = Internals.getRange();
	if (typeof frameRange === 'number') {
		Log.warn('Selected a single frame. Assuming you want to output an image.');
		Log.warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`
		);
		Log.warn("To dismiss this message, add the '--sequence' flag explicitly.");
	}

	return frameRange;
};

const getFinalCodec = async (options: {isLambda: boolean}) => {
	const userCodec = Internals.getOutputCodecOrUndefined();

	const codec = Internals.getFinalOutputCodec({
		codec: userCodec,
		fileExtension: options.isLambda ? null : getUserPassedFileExtension(),
		emitWarning: true,
		isLambda: options.isLambda,
	});
	if (
		codec === 'vp8' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libvpx'))
	) {
		Log.error(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		Log.error(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}

	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-gpl'))
	) {
		Log.error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		Log.error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libx265'))
	) {
		Log.error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		Log.error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	return codec;
};

const getBrowser = () => {
	return Internals.getBrowser() ?? Internals.DEFAULT_BROWSER;
};

const getAndValidateAbsoluteOutputFile = (
	outputFile: string,
	overwrite: boolean
) => {
	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}

	return absoluteOutputFile;
};

const getAndValidateShouldOutputImageSequence = async (
	frameRange: FrameRange | null
) => {
	const shouldOutputImageSequence = Internals.getShouldOutputImageSequence(
		frameRange
	);
	if (!shouldOutputImageSequence) {
		await RenderInternals.validateFfmpeg();
	}

	return shouldOutputImageSequence;
};

const getAndValidateCrf = (
	shouldOutputImageSequence: boolean,
	codec: Codec
) => {
	const crf = shouldOutputImageSequence ? null : Internals.getActualCrf(codec);
	if (crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

	return crf;
};

const getAndValidatePixelFormat = (codec: Codec) => {
	const pixelFormat = Internals.getPixelFormat();

	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
	return pixelFormat;
};

const getAndValidateProResProfile = (actualCodec: Codec) => {
	const proResProfile = Internals.getProResProfile();
	Internals.validateSelectedCodecAndProResCombination(
		actualCodec,
		proResProfile
	);

	return proResProfile;
};

const getAndValidateImageFormat = ({
	shouldOutputImageSequence,
	codec,
	pixelFormat,
}: {
	shouldOutputImageSequence: boolean;
	codec: Codec;
	pixelFormat: PixelFormat;
}) => {
	const imageFormat = getImageFormat(
		shouldOutputImageSequence ? undefined : codec
	);
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	return imageFormat;
};

const getAndValidateBrowser = async (browserExecutable: BrowserExecutable) => {
	const browser = getBrowser();
	try {
		await RenderInternals.ensureLocalBrowser(browser, browserExecutable);
	} catch (err) {
		Log.error('Could not download a browser for rendering frames.');
		Log.error(err);
		process.exit(1);
	}

	return browser;
};

export const getCliOptions = async (options: {
	isLambda: boolean;
	type: 'still' | 'series';
}) => {
	const frameRange = getAndValidateFrameRange();

	const codec = await getFinalCodec({isLambda: options.isLambda});
	const shouldOutputImageSequence =
		options.type === 'still'
			? true
			: await getAndValidateShouldOutputImageSequence(frameRange);
	const outputFile = options.isLambda
		? null
		: getOutputFilename({
				codec,
				imageSequence: shouldOutputImageSequence,
				type: options.type,
		  });

	const overwrite = Internals.getShouldOverwrite();
	const crf = getAndValidateCrf(shouldOutputImageSequence, codec);
	const pixelFormat = getAndValidatePixelFormat(codec);
	const imageFormat = getAndValidateImageFormat({
		shouldOutputImageSequence,
		codec,
		pixelFormat,
	});
	const proResProfile = getAndValidateProResProfile(codec);
	const browserExecutable = Internals.getBrowserExecutable();

	return {
		parallelism: Internals.getConcurrency(),
		frameRange,
		shouldOutputImageSequence,
		codec,
		overwrite: Internals.getShouldOverwrite(),
		inputProps: getInputProps(),
		envVariables: await getEnvironmentVariables(),
		quality: Internals.getQuality(),
		absoluteOutputFile: outputFile
			? getAndValidateAbsoluteOutputFile(outputFile, overwrite)
			: null,
		browser: await getAndValidateBrowser(browserExecutable),
		crf,
		pixelFormat,
		imageFormat,
		proResProfile,
		stillFrame: Internals.getStillFrame(),
		browserExecutable,
		framesPerLambda: Internals.getFramesPerLambda(),
	};
};
