import {InvokeCommand} from '@aws-sdk/client-lambda';
import {getOrCreateBucket} from '../api/get-or-create-bucket';
import {getLambdaClient} from '../shared/aws-clients';
import {LambdaPayload, LambdaRoutines} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {getCurrentRegionInFunction} from './helpers/get-current-region';

export const startHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.start) {
		throw new TypeError('Expected type start');
	}

	const {bucketName} = await getOrCreateBucket({
		region: getCurrentRegionInFunction(),
	});
	const renderId = randomHash();

	const payload: LambdaPayload = {
		type: LambdaRoutines.launch,
		framesPerLambda: params.framesPerLambda,
		composition: params.composition,
		serveUrl: params.serveUrl,
		inputProps: params.inputProps,
		bucketName,
		renderId,
		codec: params.codec,
		imageFormat: params.imageFormat,
		crf: params.crf,
		envVariables: params.envVariables,
		pixelFormat: params.pixelFormat,
		proResProfile: params.proResProfile,
		quality: params.quality,
		maxRetries: params.maxRetries,
	};
	await getLambdaClient(getCurrentRegionInFunction()).send(
		new InvokeCommand({
			FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
			// @ts-expect-error
			Payload: JSON.stringify(payload),
			InvocationType: 'Event',
		})
	);
	return {
		bucketName,
		renderId,
	};
};
