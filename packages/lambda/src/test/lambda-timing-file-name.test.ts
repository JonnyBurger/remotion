import {lambdaTimingsKey} from '../shared/constants';
import {parseLambdaTimingsKey} from '../shared/parse-lambda-timings-key';

const EXPECTED =
	'renders/8dakdd/lambda-timings/chunk:00000088-start:1625579377044-end:1625579387219.txt';

test('Should give expected file name', () => {
	expect(
		lambdaTimingsKey({
			chunk: 88,
			start: 1625579377044,
			end: 1625579387219,
			renderId: '8dakdd',
		})
	).toBe(EXPECTED);
});

test('Should be able to convert back to object', () => {
	expect(parseLambdaTimingsKey(EXPECTED)).toEqual({
		chunk: 88,
		start: 1625579377044,
		end: 1625579387219,
		renderId: '8dakdd',
	});
});
