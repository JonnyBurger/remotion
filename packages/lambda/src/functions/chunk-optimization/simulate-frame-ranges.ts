import {ChunkTimingData, TimingProfile} from './types';

export const getTimingForFrame = (profile: TimingProfile, frame: number) => {
	for (const timingInfo of profile) {
		if (timingInfo.frameRange[0] > frame || timingInfo.frameRange[1] < frame) {
			continue;
		}

		let lastTime = timingInfo.startDate;
		for (let i = 0; i < timingInfo.timings.length; i++) {
			const actualFrame = i + timingInfo.frameRange[0];
			const timing = timingInfo.timings[i];
			const absolute = timing + timingInfo.startDate;
			if (actualFrame === frame) {
				return absolute - lastTime;
			}

			lastTime = absolute;
		}
	}

	throw new Error(`Frame ${frame} was not rendered`);
};

export const getSimulatedTimingForFrameRange = (
	profile: TimingProfile,
	frameRange: [number, number]
): ChunkTimingData['timings'] => {
	const timings: ChunkTimingData['timings'] = [];

	let totalDuration = 0;
	for (let i = frameRange[0]; i <= frameRange[1]; i++) {
		const timingForFrame = getTimingForFrame(profile, i);
		timings.push(timingForFrame + totalDuration);
		totalDuration += timingForFrame;
	}

	return timings;
};

export const simulateFrameRanges = ({
	profile,
	newFrameRanges,
}: {
	profile: TimingProfile;
	newFrameRanges: [number, number][];
}): TimingProfile => {
	if (profile.length !== newFrameRanges.length) {
		throw new Error('Expected previous and new frame ranges to be equal');
	}

	return newFrameRanges.map((range, i) => {
		return {
			timings: getSimulatedTimingForFrameRange(profile, range),
			chunk: i,
			frameRange: range,
			startDate: profile[i].startDate,
		};
	});
};
