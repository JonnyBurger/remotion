import {createContext, LazyExoticComponent} from 'react';
import {LooseAnyComponent} from './any-component';

export type TComposition<T = unknown> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	component: LazyExoticComponent<LooseAnyComponent<T>>;
	props?: T;
	nonce: number;
};

export type TCompMetadata = Pick<
	TComposition,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
>;

type EnhancedTSequenceData =
	| {
			type: 'sequence';
	  }
	| {
			type: 'audio';
			src: string;
			// Volume is represented as a comma separated list - if it's a string
			// React can more efficiently update and will not rerender if anonymous functions
			// are passed.
			// If not a function was passed, a number is being used
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
	  }
	| {
			type: 'video';
			src: string;
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
	  };

export type TSequence = {
	from: number;
	duration: number;
	id: string;
	displayName: string;
	parent: string | null;
	rootId: string;
	showInTimeline: boolean;
	nonce: number;
} & EnhancedTSequenceData;

export type TAsset = {
	type: 'audio' | 'video';
	src: string;
	id: string;
	frame: number;
	volume: number;
	isRemote: boolean;
	mediaFrame: number;
	playbackRate: number;
};

export type RenderAssetInfo = {
	assets: TAsset[][];
};

export type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: <T>(comp: TComposition<T>) => void;
	unregisterComposition: (name: string) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string) => void;
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
	sequences: TSequence[];
	assets: TAsset[];
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	registerComposition: () => undefined,
	unregisterComposition: () => undefined,
	currentComposition: null,
	setCurrentComposition: () => undefined,
	registerSequence: () => undefined,
	unregisterSequence: () => undefined,
	registerAsset: () => undefined,
	unregisterAsset: () => undefined,
	sequences: [],
	assets: [],
});
