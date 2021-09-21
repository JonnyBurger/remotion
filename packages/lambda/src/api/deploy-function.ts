import {AwsRegion} from '../pricing/aws-regions';
import {RENDER_FN_PREFIX} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {randomHash} from '../shared/random-hash';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateMemorySize} from '../shared/validate-memory-size';
import {validateTimeout} from '../shared/validate-timeout';
import {bundleLambda} from './bundle-lambda';
import {createFunction} from './create-function';

/**
 * @description Creates an AWS Lambda function in your account that will be able to render a video in the cloud.
 * @link https://remotion.dev/docs/lambda/deployfunction
 * @param options.region The region you want to deploy your function to.
 * @param options.layerArn The resource identifier of the Lambda layer. See documentation for this function on how to retrieve it.
 * @param options.timeoutInSeconds After how many seconds the lambda function should be killed if it does not end itself.
 * @param options.memorySizeInMb How much memory should be allocated to the Lambda function.
 * @returns An object that contains the `functionName` property
 */
export const deployFunction = async (options: {
	region: AwsRegion;
	layerArn: string;
	timeoutInSeconds: number;
	memorySizeInMb: number;
}) => {
	validateMemorySize(options.memorySizeInMb);
	validateTimeout(options.timeoutInSeconds);
	validateAwsRegion(options.region);

	const fnNameRender = RENDER_FN_PREFIX + randomHash();
	const [renderOut, accountId] = await Promise.all([
		bundleLambda(),
		getAccountId({region: options.region}),
	]);

	const created = await createFunction({
		region: options.region,
		zipFile: renderOut,
		functionName: fnNameRender,
		accountId: accountId[1],
		memorySizeInMb: options.memorySizeInMb,
		timeoutInSeconds: options.timeoutInSeconds,
		layerArn: options.layerArn,
	});

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
	};
};
