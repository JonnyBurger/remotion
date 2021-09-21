import {estimatePrice} from '../pricing/calculate-price';

test('Should calculate costs accurately', () => {
	expect(
		estimatePrice({
			region: 'us-east-1',
			durationInMiliseconds: 20000,
			memorySizeInMb: 2048,
		})
	).toEqual(0.00067);
	expect(
		estimatePrice({
			region: 'us-east-1',
			durationInMiliseconds: 20000,
			memorySizeInMb: 1024,
		})
	).toEqual(0.00033);
});
