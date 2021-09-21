import {sortProfileByDuration} from './sort-by-duration';
import {TimingProfile} from './types';

export const optimizeInvocationOrder = (
	profile: TimingProfile
): TimingProfile => {
	const sortedByDuration = sortProfileByDuration(profile).reverse();
	const sortedByStartTime = profile
		.slice()
		.map((a) => a.startDate)
		.sort((a, b) => a - b);
	const result = sortedByStartTime.map((prof, i) => {
		return {
			...sortedByDuration[i],
			startDate: prof,
		};
	});
	return result;
};
