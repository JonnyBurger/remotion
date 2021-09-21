import {InvokeCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from './aws-clients';
import {LambdaPayloads, LambdaRoutines} from './constants';
import {LambdaReturnValues} from './return-values';

export const callLambda = async <T extends LambdaRoutines>({
	functionName,
	type,
	payload,
	region,
}: {
	functionName: string;
	type: T;
	payload: Omit<LambdaPayloads[T], 'type'>;
	region: AwsRegion;
}): Promise<LambdaReturnValues[T]> => {
	const res = await getLambdaClient(region).send(
		new InvokeCommand({
			FunctionName: functionName,
			// @ts-expect-error
			Payload: JSON.stringify({type, ...payload}),
		})
	);
	const string = Buffer.from(res.Payload as Uint8Array).toString();

	const json = JSON.parse(string) as
		| LambdaReturnValues[T]
		| {
				errorType: string;
				errorMessage: string;
				trace: string[];
		  };
	if ('errorMessage' in json) {
		const err = new Error(json.errorMessage);
		err.name = json.errorType;
		err.stack = (json.trace ?? []).join('\n');
		throw err;
	}

	return json;
};
