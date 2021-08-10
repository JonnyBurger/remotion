import {fetchFile} from '@ffmpeg/ffmpeg';
import path from 'path';
import {
	Codec,
	ImageFormat,
	Internals,
	PixelFormat,
	ProResProfile,
	RenderAssetInfo,
} from 'remotion';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import {getAssetAudioDetails} from './assets/get-asset-audio-details';
import {calculateFfmpegFilters} from './calculate-ffmpeg-filters';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getFrameInfo} from './get-frame-number-length';
import {getProResProfileName} from './get-prores-profile-name';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {resolveAssetSrc} from './resolve-asset-src';
import {
	ENABLE_WASM_FFMPEG,
	load,
	runFfmpegCommand,
	wasmFfmpeg,
} from './run-ffmpeg-command';
import {validateFfmpeg} from './validate-ffmpeg';

// eslint-disable-next-line complexity
export const stitchFramesToVideo = async (options: {
	dir: string;
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	// TODO: Let's make this parameter mandatory in the next major release
	imageFormat?: ImageFormat;
	pixelFormat?: PixelFormat;
	codec?: Codec;
	crf?: number;
	// TODO: Do we want a parallelism flag for stitcher?
	parallelism?: number | null;
	onProgress?: (progress: number) => void;
	onDownload?: (src: string) => void;
	proResProfile?: ProResProfile;
	verbose?: boolean;
}): Promise<void> => {
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
	const crf = options.crf ?? Internals.getDefaultCrfForCodec(codec);
	const imageFormat = options.imageFormat ?? DEFAULT_IMAGE_FORMAT;
	const pixelFormat = options.pixelFormat ?? Internals.DEFAULT_PIXEL_FORMAT;
	await validateFfmpeg();

	const encoderName = getCodecName(codec);
	const audioCodecName = getAudioCodecName(codec);
	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	const isAudioOnly = encoderName === null;
	const supportsCrf = encoderName && codec !== 'prores';

	if (options.verbose) {
		console.log('[verbose] encoder', encoderName);
		console.log('[verbose] audioCodec', audioCodecName);
		console.log('[verbose] pixelFormat', pixelFormat);
		console.log('[verbose] imageFormat', imageFormat);
		if (supportsCrf) {
			console.log('[verbose] crf', crf);
		}

		console.log('[verbose] codec', codec);
		console.log('[verbose] isAudioOnly', isAudioOnly);
		console.log('[verbose] proResProfileName', proResProfileName);
	}

	Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const [frameInfo, fileUrlAssets] = await Promise.all([
		getFrameInfo({
			dir: options.dir,
			isAudioOnly,
		}),
		convertAssetsToFileUrls({
			assets: options.assetsInfo.assets,
			dir: options.assetsInfo.bundleDir,
			onDownload: options.onDownload ?? (() => undefined),
		}),
	]);

	if (frameInfo?.filelist) {
		await load;
		await Promise.all(
			frameInfo.filelist.map(async (file) => {
				// eslint-disable-next-line new-cap
				return wasmFfmpeg.FS(
					'writeFile',
					file,
					await fetchFile(path.resolve(options.dir, file))
				);
			})
		);
	}

	markAllAssetsAsDownloaded();
	const assetPositions = calculateAssetPositions(fileUrlAssets);

	const assetPaths = assetPositions.map((asset) => resolveAssetSrc(asset.src));

	const assetAudioDetails = await getAssetAudioDetails({
		assetPaths,
		parallelism: options.parallelism,
	});

	const filters = calculateFfmpegFilters({
		assetAudioDetails,
		assetPositions,
		fps: options.fps,
		videoTrackCount: isAudioOnly ? 0 : 1,
	});
	if (options.verbose) {
		console.log('asset positions', assetPositions);
	}

	if (options.verbose) {
		console.log('filters', filters);
	}

	const tmpFsOutputLocation = path.basename(options.outputLocation);

	console.log({tmpFsOutputLocation});
	const {complexFilterFlag, cleanup} = await createFfmpegComplexFilter(filters);
	const ffmpegArgs = [
		['-r', String(options.fps)],
		isAudioOnly ? null : ['-f', 'image2'],
		isAudioOnly ? null : ['-s', `${options.width}x${options.height}`],
		frameInfo ? ['-start_number', String(frameInfo.startNumber)] : null,
		frameInfo
			? ['-i', `element-%0${frameInfo.numberLength}d.${imageFormat}`]
			: null,
		encoderName
			? // -c:v is the same as -vcodec as -codec:video
			  // and specified the video codec.
			  ['-c:v', encoderName]
			: // If only exporting audio, we drop the video explicitly
			  ['-vn'],
		supportsCrf ? ['-crf', String(crf)] : null,
		isAudioOnly ? null : ['-pix_fmt', pixelFormat],

		// Without explicitly disabling auto-alt-ref,
		// transparent WebM generation doesn't work
		pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
		ENABLE_WASM_FFMPEG ? tmpFsOutputLocation : options.outputLocation,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = runFfmpegCommand(ffmpegString, true, {cwd: options.dir});
	/*
	task.stderr?.on('data', (data: Buffer) => {
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(data.toString());
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	}); */
	await task;

	cleanup();
};
