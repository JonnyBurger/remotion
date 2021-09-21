import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

/**
 * @description Gets the current status of a render originally triggered via renderVideoOnLambda().
 * @link https://remotion.dev/docs/lambda/getrenderprogress
 * @param {string} params.functionName The name of the function used to trigger the render.
 * @param {string} params.bucketName The name of the bucket that was used in the render.
 * @param {string} params.renderId The ID of the render that was returned by `renderVideoOnLambda()`.
 * @param {AwsRegion} params.region The region in which the render was triggered.
 * @returns See documentation for this function to see all properties on the return object.
 */
export const getRenderProgress = async ({
	functionName,
	bucketName,
	renderId,
	region,
}: {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}) => {
	return callLambda({
		functionName,
		type: LambdaRoutines.status,
		payload: {
			bucketName,
			renderId,
		},
		region,
	});
};
