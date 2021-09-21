import {isValidOptimizationProfile} from '../functions/chunk-optimization/is-valid-profile';
import {optimizeProfile} from '../functions/chunk-optimization/optimize-profile';

test('Should not throw ongetSimulated', () => {
	expect(
		optimizeProfile([
			{
				chunk: 0,
				frameRange: [0, 10],
				startDate: 1631614363572,
				timings: [200, 215, 300, 300, 110, 200, 110, 222, 130, 500, 111],
			},
		])
	).toEqual([
		{
			chunk: 0,
			frameRange: [0, 10],
			startDate: 1631614363572,
			timings: [200, 215, 300, 300, 110, 200, 110, 222, 130, 500, 111],
		},
	]);
});

test('Should not throw ongetSimulated 2', () => {
	expect(
		optimizeProfile([
			{
				chunk: 0,
				frameRange: [0, 5],
				startDate: 1631614363572,
				timings: [200, 415, 700, 1000, 1110, 1140],
			},
			{
				chunk: 1,
				frameRange: [6, 10],
				startDate: 1631614363572,
				timings: [200, 415, 779, 1000, 1120],
			},
		])
	).toEqual([
		{
			chunk: 0,
			frameRange: [0, 3],
			startDate: 1631614363572,
			timings: [200, 415, 700, 1000],
		},
		{
			chunk: 1,
			frameRange: [4, 10],
			startDate: 1631614363572,
			timings: [110, 140, 340, 555, 919, 1140, 1260],
		},
	]);
});

test('Should say valid profile', () => {
	expect(
		isValidOptimizationProfile([
			{
				chunk: 0,
				frameRange: [0, 5],
				startDate: 1631614363572,
				timings: [200, 415, 700, 1000, 1110, 1140],
			},
			{
				chunk: 1,
				frameRange: [6, 10],
				startDate: 1631614363572,
				timings: [200, 415, 779, 1000, 1120],
			},
		])
	).toEqual(true);
	expect(
		isValidOptimizationProfile([
			{
				chunk: 0,
				frameRange: [0, 5],
				startDate: 1631614363572,
				timings: [200, 415, 700, 1000, 1110, 1140],
			},
			{
				chunk: 1,
				frameRange: [6, 10],
				startDate: 1631614363572,
				timings: [200, 415, 779, 1000, 1120, 900],
			},
		])
	).toEqual(false);
	expect(
		isValidOptimizationProfile([
			{
				chunk: 0,
				frameRange: [0, 5],
				startDate: 1631614363572,
				timings: [200, 415, 700, 1000, 1110, 1140],
			},
			{
				chunk: 1,
				frameRange: [6, 10],
				startDate: 1631614363572,
				timings: [200, 415, 779, 1000, -1120],
			},
		])
	).toEqual(false);
});
