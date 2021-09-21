import {TimingProfile} from './types';

export const isValidOptimizationProfile = (profile: TimingProfile) => {
	return profile.every((timing) => {
		const frames = timing.frameRange[1] - timing.frameRange[0] + 1;
		const values = Object.values(timing.timings);
		return frames === values.length && values.every((v) => v > 0);
	});
};
