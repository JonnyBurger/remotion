import {ListFunctionsCommand} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {CURRENT_VERSION, RENDER_FN_PREFIX} from '../shared/constants';
import {getFunctionVersion} from '../shared/get-function-version';
import {FunctionInfo} from './get-function-info';

/**
 *
 *
 * @description Lists Remotion Lambda render functions deployed to AWS Lambda.
 * @link https://remotion.dev/docs/lambda/getfunctions
 * @param options.region The region of which the functions should be listed.
 * @param options.compatibleOnly Whether only functions compatible with the installed version of Remotion Lambda should be returned.
 * @returns An array with the objects containing information about the deployed functions.
 */
export const getFunctions = async (options: {
	region: AwsRegion;
	compatibleOnly: boolean;
}): Promise<FunctionInfo[]> => {
	const lambdas = await getLambdaClient(options.region).send(
		new ListFunctionsCommand({})
	);

	const remotionLambdas = (lambdas.Functions || []).filter((f) => {
		return f.FunctionName?.startsWith(RENDER_FN_PREFIX);
	});

	const configs = await Promise.all(
		remotionLambdas.map((fn) => {
			return getFunctionVersion({
				functionName: fn.FunctionName as string,
				region: options.region,
			});
		})
	);

	const list = remotionLambdas.map((lambda, i): FunctionInfo => {
		return {
			functionName: lambda.FunctionName as string,
			version: configs[i],
			memorySizeInMb: lambda.MemorySize as number,
			timeoutInSeconds: lambda.Timeout as number,
		};
	});
	if (!options.compatibleOnly) {
		return list;
	}

	return list.filter((l) => {
		if (!options.compatibleOnly) {
			return true;
		}

		return l.version === CURRENT_VERSION;
	});
};
