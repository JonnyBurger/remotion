import type {M3uStream} from '../containers/m3u/get-streams';
import type {OnAudioSample, OnVideoSample} from '../webcodec-sample-types';

type M3uStreamOrInitialUrl =
	| {
			type: 'selected-stream';
			stream: M3uStream;
	  }
	| {
			type: 'initial-url';
			url: string;
	  };

export const m3uState = () => {
	let selectedStream: M3uStreamOrInitialUrl | null = null;
	let hasEmittedVideoTrack: null | OnVideoSample | false = false;
	let hasEmittedAudioTrack: null | OnAudioSample | false = false;
	let hasEmittedDoneWithTracks = false;
	let hasFinishedManifest = false;

	let readyToIterateOverM3u = false;
	let lastChunkProcessed = -1;
	let allChunksProcessed = false;

	return {
		setSelectedStream: (stream: M3uStreamOrInitialUrl) => {
			selectedStream = stream;
		},
		getSelectedStream: () => selectedStream,
		setHasEmittedVideoTrack: (callback: OnVideoSample | null) => {
			hasEmittedVideoTrack = callback;
		},
		hasEmittedVideoTrack: () => hasEmittedVideoTrack,
		setHasEmittedAudioTrack: (callback: OnAudioSample | null) => {
			hasEmittedAudioTrack = callback;
		},
		hasEmittedAudioTrack: () => hasEmittedAudioTrack,
		setHasEmittedDoneWithTracks: () => {
			hasEmittedDoneWithTracks = true;
		},
		hasEmittedDoneWithTracks: () => hasEmittedDoneWithTracks,
		setReadyToIterateOverM3u: () => {
			readyToIterateOverM3u = true;
		},
		isReadyToIterateOverM3u: () => readyToIterateOverM3u,
		setLastChunkProcessed: (chunk: number) => {
			lastChunkProcessed = chunk;
		},
		getLastChunkProcessed: () => lastChunkProcessed,
		getAllChunksProcessed: () => allChunksProcessed,
		setAllChunksProcessed: () => {
			allChunksProcessed = true;
		},
		setHasFinishedManifest: () => {
			hasFinishedManifest = true;
		},
		hasFinishedManifest: () => hasFinishedManifest,
	};
};

export type M3uState = ReturnType<typeof m3uState>;
