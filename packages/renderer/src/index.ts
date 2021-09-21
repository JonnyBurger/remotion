import {TAsset, TCompMetadata} from 'remotion';
import {addSilentAudioIfNecessary} from './add-silent-audio-if-necessary';
import {
	ffmpegHasFeature,
	getFfmpegBuildInfo,
	getFfmpegVersion,
} from './ffmpeg-flags';
import {getActualConcurrency} from './get-concurrency';
import {ensureLocalBrowser} from './get-local-browser-executable';
import {openBrowser} from './open-browser';
import {serveStatic} from './serve-static';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {binaryExists, validateFfmpeg} from './validate-ffmpeg';

declare global {
	interface Window {
		ready: boolean;
		getStaticCompositions: () => TCompMetadata[];
		remotion_setFrame: (frame: number) => void;
		remotion_collectAssets: () => TAsset[];
	}
}

export {combineVideos} from './combine-videos';
export {FfmpegVersion} from './ffmpeg-flags';
export {getCompositions} from './get-compositions';
export {renderFrames} from './render';
export {renderStill} from './render-still';
export {stitchFramesToVideo} from './stitcher';
export {OnErrorInfo, OnStartData, RenderFramesOutput} from './types';

export const RenderInternals = {
	ensureLocalBrowser,
	ffmpegHasFeature,
	getActualConcurrency,
	getFfmpegVersion,
	openBrowser,
	validateFfmpeg,
	binaryExists,
	getFfmpegBuildInfo,
	serveStatic,
	addSilentAudioIfNecessary,
	validateEvenDimensionsWithCodec,
};
