import type {
	LambdaPayload,
	RenderProgress} from '../shared/constants';
import {
	LambdaRoutines
} from '../shared/constants';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getProgress} from './helpers/get-progress';

type Options = {
	expectedBucketOwner: string;
	timeoutInMiliseconds: number;
};

export const progressHandler = (
	lambdaParams: LambdaPayload,
	options: Options
): Promise<RenderProgress> => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	return getProgress({
		bucketName: lambdaParams.bucketName,
		renderId: lambdaParams.renderId,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		timeoutInMiliseconds: options.timeoutInMiliseconds,
	});
};
