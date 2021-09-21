import {DeleteFunctionCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';

/**
 * @description Deletes a function from AWS Lambda.
 * @link https://remotion.dev/docs/lambda/deletefunction
 * @param options.region The region the function was deployed to.
 * @param options.functionName The name of the function.
 * @returns Nothing. Throws if the function failed to delete.
 */
export const deleteFunction = async ({
	region,
	functionName,
}: {
	region: AwsRegion;
	functionName: string;
}): Promise<void> => {
	await getLambdaClient(region).send(
		new DeleteFunctionCommand({
			FunctionName: functionName,
		})
	);
};
