import {InvokeCommand} from '@aws-sdk/client-lambda';
import {getLambdaClient} from '../shared/aws-clients';
import {LambdaPayload, LambdaRoutines} from '../shared/constants';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {timer} from './helpers/timer';

export const fireHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.fire) {
		throw new Error('should be a fire param');
	}

	await Promise.all(
		params.payloads.map(async (payload, index) => {
			const callingLambdaTimer = timer('Calling lambda ' + index);
			await getLambdaClient(getCurrentRegionInFunction()).send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(payload),
					InvocationType: 'Event',
				}),
				{}
			);
			callingLambdaTimer.end();
		})
	);
};
