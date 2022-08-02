import execa from 'execa';
import type {OffthreadVideoImageFormat} from 'remotion';
import type {
	DownloadMap,
	SpecialVCodecForTransparency,
} from './assets/download-map';
import {getVideoStreamDuration} from './assets/get-video-stream-duration';
import {ensurePresentationTimestamps} from './ensure-presentation-timestamp';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';
import {getVideoInfo} from './get-video-info';
import {isBeyondLastFrame, markAsBeyondLastFrame} from './is-beyond-last-frame';
import type {LastFrameOptions} from './last-frame-from-video-cache';
import {
	getLastFrameFromCache,
	setLastFrameInCache,
} from './last-frame-from-video-cache';
import {pLimit} from './p-limit';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {truthy} from './truthy';

const lastFrameLimit = pLimit(1);
const mainLimit = pLimit(5);

const determineVcodecFfmepgFlags = (
	vcodecFlag: SpecialVCodecForTransparency
) => {
	return [
		vcodecFlag === 'vp9' ? '-vcodec' : null,
		vcodecFlag === 'vp9' ? 'libvpx-vp9' : null,
		vcodecFlag === 'vp8' ? '-vcodec' : null,
		vcodecFlag === 'vp8' ? 'libvpx' : null,
	].filter(truthy);
};

const determineResizeParams = (
	needsResize: [number, number] | null
): string[] => {
	if (needsResize === null) {
		return [];
	}

	return ['-s', `${needsResize[0]}x${needsResize[1]}`];
};

// Uses no seeking, therefore the whole video has to be decoded. This is a last resort and should only happen
// if the video is corrupted
const getFrameOfVideoSlow = async ({
	src,
	timestamp,
	ffmpegExecutable,
	imageFormat,
	specialVCodecForTransparency,
	needsResize,
}: {
	ffmpegExecutable: FfmpegExecutable;
	src: string;
	timestamp: number;
	imageFormat: OffthreadVideoImageFormat;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
	needsResize: [number, number] | null;
}) => {
	console.warn(
		`\nUsing a slow method to extract the frame at ${timestamp}ms of ${src}. See https://remotion.dev/docs/slow-method-to-extract-frame for advice`
	);

	const actualOffset = `-${timestamp * 1000}ms`;
	const command = [
		'-itsoffset',
		actualOffset,
		...determineVcodecFfmepgFlags(specialVCodecForTransparency),
		'-i',
		src,
		'-frames:v',
		'1',
		'-c:v',
		imageFormat === 'jpeg' ? 'mjpeg' : 'png',
		'-f',
		'image2pipe',
		...determineResizeParams(needsResize),
		'-',
	].filter(truthy);

	const {stdout, stderr} = execa(ffmpegExecutable ?? 'ffmpeg', command);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stderrChunks: Buffer[] = [];
	const stdoutChunks: Buffer[] = [];

	const stdErrString = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf-8'))
		);
	});

	const stdoutChunk = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => stdoutChunks.push(d));
		stdout.on('error', (err) => reject(err));
		stdout.on('end', () => resolve(Buffer.concat(stdoutChunks)));
	});

	const [stdErr, stdoutBuffer] = await Promise.all([stdErrString, stdoutChunk]);

	const isEmpty = stdErr.includes('Output file is empty');
	if (isEmpty) {
		throw new Error(
			`Could not get last frame of ${src}. Tried to seek to the end using the command "ffmpeg ${command.join(
				' '
			)}" but got no frame. Most likely this video is corrupted.`
		);
	}

	return stdoutBuffer;
};

const getLastFrameOfVideoFastUnlimited = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const {ffmpegExecutable, ffprobeExecutable, offset, src, downloadMap} =
		options;
	const fromCache = getLastFrameFromCache({...options, offset: 0});
	if (fromCache) {
		return fromCache;
	}

	const {duration, fps} = await getVideoStreamDuration(
		downloadMap,
		src,
		ffprobeExecutable
	);

	if (duration === null) {
		throw new Error(
			`Could not determine the duration of ${src} using FFMPEG. The file is not supported.`
		);
	}

	if (options.specialVCodecForTransparency === 'vp8' || offset > 40) {
		const last = await getFrameOfVideoSlow({
			timestamp: duration,
			ffmpegExecutable,
			src,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
			needsResize: options.needsResize,
		});
		return last;
	}

	const actualOffset = `${duration * 1000 - offset}ms`;
	const {stdout, stderr} = execa(
		ffmpegExecutable ?? 'ffmpeg',
		[
			'-ss',
			actualOffset,
			...determineVcodecFfmepgFlags(options.specialVCodecForTransparency),
			'-i',
			src,
			'-frames:v',
			'1',
			'-c:v',
			options.imageFormat === 'jpeg' ? 'mjpeg' : 'png',
			'-f',
			'image2pipe',
			...determineResizeParams(options.needsResize),
			'-',
		].filter(truthy)
	);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stderrChunks: Buffer[] = [];
	const stdoutChunks: Buffer[] = [];

	const stdErrString = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf-8'))
		);
	});

	const stdoutChunk = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => {
			stdoutChunks.push(d);
		});
		stdout.on('error', (err) => {
			reject(err);
		});
		stdout.on('end', () => {
			resolve(Buffer.concat(stdoutChunks));
		});
	});

	const [stdErr, stdoutBuffer] = await Promise.all([stdErrString, stdoutChunk]);

	const isEmpty = stdErr.includes('Output file is empty');
	if (isEmpty) {
		const unlimited = await getLastFrameOfVideoFastUnlimited({
			ffmpegExecutable,
			// Decrement in 10ms increments, or 1 frame (e.g. fps = 25 --> 40ms)
			offset: offset + 1000 / (fps === null ? 10 : fps),
			src,
			ffprobeExecutable,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
			needsResize: options.needsResize,
			downloadMap: options.downloadMap,
		});

		return unlimited;
	}

	return stdoutBuffer;
};

export const getLastFrameOfVideo = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const result = await lastFrameLimit(
		getLastFrameOfVideoFastUnlimited,
		options
	);
	setLastFrameInCache(options, result);

	return result;
};

type Options = {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	imageFormat: OffthreadVideoImageFormat;
	downloadMap: DownloadMap;
};

const extractFrameFromVideoFn = async ({
	time,
	ffmpegExecutable,
	ffprobeExecutable,
	imageFormat,
	downloadMap,
	...options
}: Options): Promise<Buffer> => {
	// We make a new copy of the video only for video because the conversion may affect
	// audio rendering, so we work with 2 different files
	const src = await ensurePresentationTimestamps(downloadMap, options.src);
	const {specialVcodec, needsResize} = await getVideoInfo(
		downloadMap,
		src,
		ffprobeExecutable
	);

	if (specialVcodec === 'vp8') {
		return getFrameOfVideoSlow({
			ffmpegExecutable,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			src,
			timestamp: time,
			needsResize,
		});
	}

	if (isBeyondLastFrame(downloadMap, src, time)) {
		const lastFrame = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			needsResize,
			downloadMap,
		});
		return lastFrame;
	}

	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout, stderr} = execa(
		ffmpegExecutable ?? 'ffmpeg',
		[
			'-ss',
			ffmpegTimestamp,
			...determineVcodecFfmepgFlags(specialVcodec),
			'-i',
			src,
			'-frames:v',
			'1',
			'-f',
			'image2pipe',
			'-vcodec',
			imageFormat === 'jpeg' ? 'mjpeg' : 'png',
			...determineResizeParams(needsResize),
			'-',
		].filter(truthy),
		{
			buffer: false,
		}
	);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stdoutChunks: Buffer[] = [];
	const stderrChunks: Buffer[] = [];

	const stderrStringProm = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf8'))
		);
	});

	const stdoutBuffer = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => stdoutChunks.push(d));
		stdout.on('error', (err) => reject(err));
		stdout.on('end', () => resolve(Buffer.concat(stdoutChunks)));
	});

	const [stderrStr, stdOut] = await Promise.all([
		stderrStringProm,
		stdoutBuffer,
	]);

	if (stderrStr.includes('Output file is empty')) {
		markAsBeyondLastFrame(downloadMap, src, time);
		const last = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			needsResize,
			downloadMap,
		});

		return last;
	}

	return stdOut;
};

export const extractFrameFromVideo = async (options: Options) => {
	const perf = startPerfMeasure('extract-frame');
	const res = await mainLimit(extractFrameFromVideoFn, options);
	stopPerfMeasure(perf);
	return res;
};
