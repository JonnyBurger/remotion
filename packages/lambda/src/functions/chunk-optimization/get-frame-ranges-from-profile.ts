import {TimingProfile} from './types';

export const getFrameRangesFromProfile = (
	profile: TimingProfile
): [number, number][] => {
	return profile.map((p) => p.frameRange);
};

export const sortProfileByFrameRanges = (profile: TimingProfile) => {
	return profile.slice().sort((a, b) => a.frameRange[0] - b.frameRange[0]);
};
