import {CURRENT_VERSION, LambdaRoutines} from '../../defaults';
import {handler} from '../../functions/index';

test('Call function locally', async () => {
	expect(
		await handler(
			{type: LambdaRoutines.info},
			{
				invokedFunctionArn: 'arn',
			}
		)
	).toEqual({version: CURRENT_VERSION});
});
