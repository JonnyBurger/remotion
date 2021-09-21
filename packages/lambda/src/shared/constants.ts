import {
	Codec,
	ImageFormat,
	PixelFormat,
	ProResProfile,
	VideoConfig,
} from 'remotion';
import {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';
import {AwsRegion} from '../pricing/aws-regions';
import {getFileExtensionFromCodec} from './get-file-extension-from-codec';

export const MIN_MEMORY = 512;
export const MAX_MEMORY = 10240;
export const DEFAULT_MEMORY_SIZE = 2048;

export const DEFAULT_TIMEOUT = 120;
export const MIN_TIMEOUT = 15;
export const MAX_TIMEOUT = 900;

export const MINIMUM_FRAMES_PER_LAMBDA = 4;
export const DEFAULT_FRAMES_PER_LAMBDA = 20;

export const BINARY_NAME = 'remotion lambda';
export const COMMAND_NOT_FOUND = 'Command not found';
export const DEFAULT_REGION: AwsRegion = 'us-east-1';

// TODO: Rename other buckets in Jonnys accoudn first
export const REMOTION_BUCKET_PREFIX = 'remotionlambda-';
export const RENDER_FN_PREFIX = 'remotion-render-';
export const rendersPrefix = (renderId: string) => `renders/${renderId}`;
export const encodingProgressKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/encoding-progress.json`;
export const renderMetadataKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/pre-render-metadata.json`;
export const lambdaInitializedPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/lambda-initialized`;
export const lambdaInitializedKey = ({
	renderId,
	chunk,
}: {
	renderId: string;
	chunk: number;
}) => `${lambdaInitializedPrefix(renderId)}-${chunk}.txt`;
export const lambdaTimingsPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/lambda-timings/chunk:`;

export const lambdaTimingsPrefixForChunk = (renderId: string, chunk: number) =>
	lambdaTimingsPrefix(renderId) + String(chunk).padStart(8, '0');
export const lambdaTimingsKey = ({
	renderId,
	chunk,
	start,
	end,
}: {
	renderId: string;
	chunk: number;
	start: number;
	end: number;
}) =>
	`${lambdaTimingsPrefixForChunk(
		renderId,
		chunk
	)}-start:${start}-end:${end}.txt`;
export const chunkKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/chunks/chunk-`;
export const chunkKeyForIndex = ({
	renderId,
	index,
}: {
	renderId: string;
	index: number;
}) => `${chunkKey(renderId)}${String(index).padStart(8, '0')}`;
export const getErrorKeyPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/errors/`;
export const optimizationProfile = (siteId: string, compositionId: string) =>
	`optimization-profiles/${siteId}/${compositionId}/optimization-profile`;
export const getSitesKey = (siteId: string) => `sites/${siteId}`;
export const outName = (renderId: string, codec: Codec) =>
	`${rendersPrefix(renderId)}/out.${getFileExtensionFromCodec(codec, 'final')}`;
export const outStillName = (renderId: string, imageFormat: ImageFormat) =>
	`${rendersPrefix(renderId)}/out.${imageFormat}`;
export const BINARIES_BUCKET_PREFIX = 'lambda-remotion-binaries-';
export const getBinariesBucketName = (region: AwsRegion) => {
	return BINARIES_BUCKET_PREFIX + region;
};

export const postRenderDataKey = (renderId: string) => {
	return `${rendersPrefix(renderId)}/post-render-metadata.json`;
};

export const DOWNLOADS_DIR = '/tmp/downloads';
export const OUTPUT_PATH_PREFIX = '/tmp/remotion-render-';
export const RENDERER_PATH_TOKEN = 'remotion-bucket';
export const RENDERER_PATH_PREFIX = '/tmp/' + RENDERER_PATH_TOKEN;

export const CONCAT_FOLDER_TOKEN = 'remotion-concat';
export const CONCAT_TMPDIR = '/tmp/' + CONCAT_FOLDER_TOKEN;

export const REMOTION_CONCATED_TOKEN = 'remotion-concated-token';
export const REMOTION_CONCATED_TMP_PREFIX = '/tmp/' + REMOTION_CONCATED_TOKEN;

export const REMOTION_FILELIST_TOKEN = 'remotion-filelist';
export const REMOTION_FILELIST_TMP_PREFIX = '/tmp' + REMOTION_FILELIST_TOKEN;

export enum LambdaRoutines {
	info = 'info',
	start = 'start',
	launch = 'launch',
	status = 'status',
	fire = 'fire',
	renderer = 'renderer',
	still = 'still',
}

export type LambdaPayloads = {
	info: {
		type: LambdaRoutines.info;
	};
	start: {
		type: LambdaRoutines.start;
		serveUrl: string;
		composition: string;
		framesPerLambda: number;
		inputProps: unknown;
		codec: Codec;
		imageFormat: ImageFormat;
		crf: number | undefined;
		envVariables: Record<string, string> | undefined;
		pixelFormat: PixelFormat | undefined;
		proResProfile: ProResProfile | undefined;
		quality: number | undefined;
		maxRetries: number;
	};
	launch: {
		type: LambdaRoutines.launch;
		serveUrl: string;
		composition: string;
		framesPerLambda: number;
		bucketName: string;
		inputProps: unknown;
		renderId: string;
		imageFormat: ImageFormat;
		codec: Codec;
		crf: number | undefined;
		envVariables: Record<string, string> | undefined;
		pixelFormat: PixelFormat | undefined;
		proResProfile: ProResProfile | undefined;
		quality: number | undefined;
		maxRetries: number;
	};
	fire: {
		type: LambdaRoutines.fire;
		payloads: unknown[];
		renderId: string;
	};
	status: {
		type: LambdaRoutines.status;
		bucketName: string;
		renderId: string;
	};
	renderer: {
		type: LambdaRoutines.renderer;
		serveUrl: string;
		frameRange: [number, number];
		chunk: number;
		bucketName: string;
		composition: string;
		fps: number;
		height: number;
		width: number;
		durationInFrames: number;
		retriesLeft: number;
		inputProps: unknown;
		renderId: string;
		imageFormat: ImageFormat;
		codec: Codec;
		crf: number | undefined;
		proResProfile: ProResProfile | undefined;
		pixelFormat: PixelFormat | undefined;
		quality: number | undefined;
		envVariables: Record<string, string> | undefined;
	};
	still: {
		type: LambdaRoutines.still;
		serveUrl: string;
		composition: string;
		inputProps: unknown;
		imageFormat: ImageFormat;
		envVariables: Record<string, string> | undefined;
		quality: number | undefined;
		maxRetries: number;
		frame: number;
		privacy: 'private' | 'public';
	};
};

export type LambdaPayload = LambdaPayloads[LambdaRoutines];

export type EncodingProgress = {
	framesEncoded: number;
};

export type RenderMetadata = {
	siteId: string;
	videoConfig: VideoConfig;
	startedDate: number;
	totalChunks: number;
	estimatedLambdaInvokations: number;
	compositionId: string;
	codec: Codec | null;
	usesOptimizationProfile: boolean;
	type: 'still' | 'video';
	imageFormat: ImageFormat;
	inputProps: unknown;
	framesPerLambda: number;
	memorySizeInMb: number;
	lambdaVersion: LambdaVersions;
	region: AwsRegion;
};

export type LambdaVersions =
	| '2021-09-15'
	| '2021-09-06'
	| '2021-08-06'
	| '2021-07-14'
	| '2021-07-05'
	| '2021-07-02'
	| '2021-06-23'
	| 'n/a';
export const CURRENT_VERSION: LambdaVersions = '2021-09-15';

export type PostRenderData = {
	cost: {
		estimatedCost: number;
		estimatedDisplayCost: string;
		currency: string;
		disclaimer: string;
	};
	outputFile: string;
	outputSize: number;
	// TODO: Confusing, should be renderSize
	bucketSize: number;
	timeToFinish: number;
	errors: EnhancedErrorInfo[];
	startTime: number;
	endTime: number;
	filesCleanedUp: number;
	renderMetadata: RenderMetadata;
};

export type CostsInfo = {
	accruedSoFar: number;
	displayCost: string;
	currency: string;
	disclaimer: string;
};

export type CleanupInfo = {
	done: boolean;
	filesToDelete: number;
	filesDeleted: number;
};

export type RenderProgress = {
	chunks: number;
	done: boolean;
	encodingStatus: EncodingProgress | null;
	costs: CostsInfo;
	renderId: string;
	renderMetadata: RenderMetadata | null;
	bucket: string;
	outputFile: string | null;
	timeToFinish: number | null;
	errors: EnhancedErrorInfo[];
	fatalErrorEncountered: boolean;
	currentTime: number;
	bucketSize: number;
	lambdasInvoked: number;
	cleanup: CleanupInfo | null;
};

export type LambdaAcl = 'public-read' | 'private';
