import {defaultSelectM3uStreamFn} from './containers/m3u/select-stream';
import {fetchReader} from './fetch';
import {internalParseMedia} from './internal-parse-media';
import {mediaParserController} from './media-parser-controller';
import {forwardMediaParserControllerToWorker} from './worker/forward-controller';
import {serializeError} from './worker/serialize-error';
import type {ParseMediaOnWorker, WorkerPayload} from './worker/worker-types';

const post = (message: WorkerPayload) => {
	postMessage(message);
};

const controller = mediaParserController();

const startParsing = async (message: ParseMediaOnWorker) => {
	const {
		src,
		fields,
		acknowledgeRemotionLicense,
		logLevel: userLogLevel,
		onAudioCodec,
		onAudioTrack,
		onContainer,
		onDimensions,
		onDurationInSeconds,
		onFps,
		onImages,
		onInternalStats,
		onIsHdr,
		onKeyframes,
		onLocation,
		onM3uStreams,
		onMetadata,
		onMimeType,
		onName,
		onNumberOfAudioChannels,
		onParseProgress,
		onRotation,
		onSampleRate,
		onSize,
		onSlowAudioBitrate,
		onSlowDurationInSeconds,
		onSlowFps,
		onSlowKeyframes,
		onSlowNumberOfFrames,
		onSlowVideoBitrate,
		onStructure,
		onTracks,
		onUnrotatedDimensions,
		onVideoCodec,
		onVideoTrack,
		progressIntervalInMs,
		selectM3uStream,
	} = message.payload;

	const logLevel = userLogLevel ?? 'info';

	try {
		const ret = await internalParseMedia({
			src,
			// TODO: Reader should be dynamic
			reader: fetchReader,
			acknowledgeRemotionLicense: Boolean(acknowledgeRemotionLicense),
			onError: () => ({action: 'fail'}),
			logLevel,
			fields: fields ?? null,
			apiName: 'parseMediaInWorker()',
			controller,
			mode: 'query',
			// TODO: on* APIs should be callback based
			onAudioCodec: onAudioCodec ?? null,
			onAudioTrack: onAudioTrack ?? null,
			onContainer: onContainer ?? null,
			onDimensions: onDimensions ?? null,
			onDiscardedData: null,
			onDurationInSeconds: onDurationInSeconds ?? null,
			onFps: onFps ?? null,
			onImages: onImages ?? null,
			onInternalStats: onInternalStats ?? null,
			onIsHdr: onIsHdr ?? null,
			onKeyframes: onKeyframes ?? null,
			onLocation: onLocation ?? null,
			onM3uStreams: onM3uStreams ?? null,
			onMetadata: onMetadata ?? null,
			onMimeType: onMimeType ?? null,
			onName: onName ?? null,
			onNumberOfAudioChannels: onNumberOfAudioChannels ?? null,
			onRotation: onRotation ?? null,
			onSampleRate: onSampleRate ?? null,
			onSize: onSize ?? null,
			onSlowAudioBitrate: onSlowAudioBitrate ?? null,
			onSlowDurationInSeconds: onSlowDurationInSeconds ?? null,
			onSlowFps: onSlowFps ?? null,
			onSlowKeyframes: onSlowKeyframes ?? null,
			onSlowNumberOfFrames: onSlowNumberOfFrames ?? null,
			onSlowVideoBitrate: onSlowVideoBitrate ?? null,
			onStructure: onStructure ?? null,
			onTracks: onTracks ?? null,
			onParseProgress: onParseProgress ?? null,
			onUnrotatedDimensions: onUnrotatedDimensions ?? null,
			onVideoCodec: onVideoCodec ?? null,
			onVideoTrack: onVideoTrack ?? null,
			progressIntervalInMs: progressIntervalInMs ?? null,
			selectM3uStream: selectM3uStream ?? defaultSelectM3uStreamFn,
		});
		post({
			type: 'response-done',
			payload: ret,
		});
	} catch (e) {
		post(serializeError(e as Error, logLevel));
	}
};

const onMessageForWorker = forwardMediaParserControllerToWorker(controller);

addEventListener('message', (message) => {
	const data = message.data as WorkerPayload;

	if (data.type === 'request-worker') {
		startParsing(data);
	}

	onMessageForWorker(data);
});
