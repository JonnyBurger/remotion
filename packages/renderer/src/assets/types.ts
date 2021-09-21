import {TAsset} from 'remotion';

// An unsafe asset is an asset with looser types, which occurs
// during construction of the asset list. Prefer the MediaAsset
// type instead.
export type UnsafeAsset = Omit<
	TAsset,
	'frame' | 'id' | 'volume' | 'mediaFrame'
> & {
	startInVideo: number;
	duration: number | null;
	trimLeft: number;
	volume: number[];
	id: string;
	playbackRate: number;
};

// Volume can either be static, for all frames the same,
// or an array with volume for each frame.
export type AssetVolume = number | number[];

export type MediaAsset = Omit<UnsafeAsset, 'duration' | 'volume'> & {
	duration: number;
	volume: AssetVolume;
};

export type AssetAudioDetails = {
	channels: number;
};

export type Assets = MediaAsset[];

export interface DownloadableAsset {
	isRemote: boolean;
	src: string;
}
