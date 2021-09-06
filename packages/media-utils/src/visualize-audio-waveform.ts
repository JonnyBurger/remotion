import {Bar, getWaveformPortion} from './get-waveform-portion';
import {AudioData} from './types';

const cache: {[key: string]: Bar[]} = {};

type FnParameters = {
	audioData: AudioData;
	frame: number;
	fps: number;
	waveformDuration: number;
	numberOfSamples: number;
};

const visualizeAudioWaveformFrame = ({
	audioData,
	frame,
	fps,
	numberOfSamples,
	waveformDuration,
}: FnParameters) => {
	if (waveformDuration * audioData.sampleRate < numberOfSamples) {
		throw new TypeError(
			waveformDuration +
				's audiodata does not have ' +
				numberOfSamples +
				' bars. Increase waveformDuration or decrease numberOfSamples'
		);
	}

	const cacheKey =
		audioData.resultId + frame + fps + numberOfSamples + 'waveform';
	if (cache[cacheKey]) {
		return cache[cacheKey];
	}

	const startTimeInSeconds =
		frame / fps < waveformDuration
			? 0
			: frame / fps + waveformDuration / 2 >= audioData.durationInSeconds
			? audioData.durationInSeconds - waveformDuration
			: frame / fps - waveformDuration / 2;
	return getWaveformPortion({
		audioData,
		startTimeInSeconds,
		durationInSeconds: waveformDuration,
		numberOfSamples,
	});
};

export const visualizeAudioWaveform = ({
	smoothing = true,
	...parameters
}: FnParameters & {
	smoothing?: boolean;
}) => {
	if (smoothing) {
		console.log('nice');
	}

	const data = visualizeAudioWaveformFrame(parameters);
	return data.map((value) => value.amplitude);
};
