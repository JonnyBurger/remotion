import {
	getFrameRangesFromProfile,
	sortProfileByFrameRanges,
} from '../functions/chunk-optimization/get-frame-ranges-from-profile';
import {getProfileDuration} from '../functions/chunk-optimization/get-profile-duration';
import {optimizeInvocationOrder} from '../functions/chunk-optimization/optimize-invocation-order';
import {
	assignFrameToOther,
	optimizeProfile,
	optimizeProfileRecursively,
} from '../functions/chunk-optimization/optimize-profile';
import {
	getSimulatedTimingForFrameRange,
	getTimingForFrame,
	simulateFrameRanges,
} from '../functions/chunk-optimization/simulate-frame-ranges';
import {demoProfiles} from './demo-profile';
import {demoProfile2} from './demo-profile-2';

test('Should measure demo profile correctly', () => {
	expect(getProfileDuration(demoProfiles)).toEqual(29202);
});

test('Should get correct duration for a frame', () => {
	expect(getTimingForFrame(demoProfiles, 19)).toEqual(
		demoProfiles[0].timings[19] - demoProfiles[0].timings[18]
	);
	expect(getTimingForFrame(demoProfiles, 19)).toEqual(102);
	expect(getTimingForFrame(demoProfiles, 20)).toEqual(
		demoProfiles[1].timings[0]
	);
	expect(getTimingForFrame(demoProfiles, 20)).toEqual(951);
});

test('Get simulated profile for frame range', () => {
	expect(getSimulatedTimingForFrameRange(demoProfiles, [10, 29])).toEqual([
		83, 166, 250, 333, 433, 518, 600, 683, 784, 886, 1837, 1948, 2049, 2149,
		2264, 2347, 2431, 2531, 2614, 2695,
	]);
});

test('Parser should not lose precision, same duration after parsing and reconstruction', () => {
	const reconstructed = simulateFrameRanges({
		profile: demoProfiles,
		newFrameRanges: getFrameRangesFromProfile(demoProfiles),
	});

	expect(getProfileDuration(reconstructed)).toEqual(29202);
	expect(getProfileDuration(reconstructed)).toEqual(
		getProfileDuration(demoProfiles)
	);
});

describe('Move frame from 1 frame range to another', () => {
	const frameRanges: [number, number][] = [
		[0, 19],
		[20, 39],
		[40, 59],
	];
	test('Case from < to', () => {
		expect(
			assignFrameToOther({
				frameRanges,
				fromChunk: 0,
				toChunk: 2,
				framesToShift: 1,
			})
		).toEqual([
			[0, 18],
			[19, 38],
			[39, 59],
		]);
	});
	test('Case from > to', () => {
		expect(
			assignFrameToOther({
				frameRanges,
				fromChunk: 2,
				toChunk: 0,
				framesToShift: 1,
			})
		).toEqual([
			[0, 20],
			[21, 40],
			[41, 59],
		]);
	});
});

test('Optimize profile', () => {
	const sortedProfile = sortProfileByFrameRanges(demoProfiles);
	const optimized = optimizeProfileRecursively(sortedProfile, 400);

	const newDuration = getProfileDuration(optimized);
	expect(newDuration).toBeLessThan(10000);
	const optimizedInvocationOrder = getProfileDuration(
		optimizeInvocationOrder(optimized)
	);
	expect(optimizedInvocationOrder).toBeLessThan(9000);
	expect(optimizedInvocationOrder).toBeLessThan(newDuration);
});

test('Optimize profile edge case', () => {
	optimizeProfile(demoProfile2);
});
