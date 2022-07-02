import execa from 'execa';
import type {
	Codec,
	FfmpegExecutable,
	ImageFormat,
	PixelFormat,
	ProResProfile,
} from 'remotion';
import {Internals} from 'remotion';
import {getCodecName} from './get-codec-name';
import {getProResProfileName} from './get-prores-profile-name';
import type {CancelSignal} from './make-cancel-signal';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';

type PreSticherOptions = {
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	pixelFormat: PixelFormat | undefined;
	codec: Codec | undefined;
	crf: number | null | undefined;
	onProgress: (progress: number) => void;
	proResProfile: ProResProfile | undefined;
	verbose: boolean;
	ffmpegExecutable: FfmpegExecutable | undefined;
	imageFormat: ImageFormat;
	signal: CancelSignal;
};

export const prespawnFfmpeg = async (options: PreSticherOptions) => {
	Internals.validateDimension(
		options.height,
		'height',
		'passed to `stitchFramesToVideo()`'
	);
	Internals.validateDimension(
		options.width,
		'width',
		'passed to `stitchFramesToVideo()`'
	);
	Internals.validateFps(options.fps, 'passed to `stitchFramesToVideo()`');
	const codec = options.codec ?? Internals.DEFAULT_CODEC;
	validateEvenDimensionsWithCodec({
		width: options.width,
		height: options.height,
		codec,
		scale: 1,
	});
	const crf = options.crf ?? Internals.getDefaultCrfForCodec(codec);
	const pixelFormat = options.pixelFormat ?? Internals.DEFAULT_PIXEL_FORMAT;
	await validateFfmpeg(options.ffmpegExecutable ?? null);

	const encoderName = getCodecName(codec);
	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	if (encoderName === null) {
		throw new TypeError('encoderName is null: ' + JSON.stringify(options));
	}

	const supportsCrf = codec !== 'prores';

	if (options.verbose) {
		console.log(
			'[verbose] ffmpeg',
			options.ffmpegExecutable ?? 'ffmpeg in PATH'
		);
		console.log('[verbose] encoder', encoderName);
		console.log('[verbose] pixelFormat', pixelFormat);
		if (supportsCrf) {
			console.log('[verbose] crf', crf);
		}

		console.log('[verbose] codec', codec);
		console.log('[verbose] proResProfileName', proResProfileName);
	}

	Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const ffmpegArgs = [
		['-r', String(options.fps)],
		...[
			['-f', 'image2pipe'],
			['-s', `${options.width}x${options.height}`],
			// If scale is very small (like 0.1), FFMPEG cannot figure out the image
			// format on it's own and we need to hint the format
			['-vcodec', options.imageFormat === 'jpeg' ? 'mjpeg' : 'png'],
			['-i', '-'],
		],
		// -c:v is the same as -vcodec as -codec:video
		// and specified the video codec.
		['-c:v', encoderName],
		proResProfileName ? ['-profile:v', proResProfileName] : null,
		supportsCrf ? ['-crf', String(crf)] : null,
		['-pix_fmt', pixelFormat],

		// Without explicitly disabling auto-alt-ref,
		// transparent WebM generation doesn't work
		pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
		['-b:v', '1M'],
		'-y',
		options.outputLocation,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];

	const task = execa(options.ffmpegExecutable ?? 'ffmpeg', ffmpegString);

	options.signal(() => {
		task.kill();
	});

	let ffmpegOutput = '';
	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegOutput += str;
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(str);
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});
	return {task, getLogs: () => ffmpegOutput};
};
