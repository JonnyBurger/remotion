import {Internals} from 'remotion';
import {handler} from '../functions/index';
import {Await} from '../shared/await';
import {LambdaRoutines} from '../shared/constants';
import {LambdaReturnValues} from '../shared/return-values';

test('Info handler should return version', async () => {
	Internals.Logging.setLogLevel('error');
	const response = await handler(
		{
			type: LambdaRoutines.info,
		},
		{invokedFunctionArn: '::::::'}
	);

	expect(
		typeof (response as Await<LambdaReturnValues[LambdaRoutines.info]>)
			.version === 'string'
	).toBe(true);
});
