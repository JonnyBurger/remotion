import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {AwsRegion} from '../../pricing/aws-regions';
import {getErrorKeyPrefix} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';
import {errorIsOutOfSpaceError} from './is-enosp-err';
import {EnhancedErrorInfo, LambdaErrorInfo} from './write-lambda-error';

const FAILED_TO_LAUNCH_TOKEN = 'Failed to launch browser.';

const getExplanation = (stack: string) => {
	if (stack.includes('FATAL:zygote_communication_linux.cc')) {
		return (
			FAILED_TO_LAUNCH_TOKEN +
			' Will be retried - you can probably ignore this error.'
		);
	}

	if (stack.includes('error while loading shared libraries: libnss3.so')) {
		return (
			FAILED_TO_LAUNCH_TOKEN +
			' Will be retried - you can probably ignore this error.'
		);
	}

	if (errorIsOutOfSpaceError(stack)) {
		return 'Your lambda function reached the 512MB storage limit. Reduce the amount of space needed per lambda function. Feel free to reach out to #lambda Discord for help';
	}

	return null;
};

export const inspectErrors = async ({
	contents,
	bucket,
	region,
	renderId,
	expectedBucketOwner,
}: {
	contents: _Object[];
	bucket: string;
	region: AwsRegion;
	renderId: string;
	expectedBucketOwner: string;
}): Promise<EnhancedErrorInfo[]> => {
	const errs = contents
		.filter((c) => c.Key?.startsWith(getErrorKeyPrefix(renderId)))
		.map((c) => c.Key)
		.filter(Internals.truthy);

	if (errs.length === 0) {
		return [];
	}

	const errors = await Promise.all(
		errs.map(async (key) => {
			const Body = await lambdaReadFile({
				bucketName: bucket,
				key,
				region,
				expectedBucketOwner,
			});
			const errorLog = await streamToString(Body);
			return errorLog;
		})
	);
	return errors.map((e, index): EnhancedErrorInfo => {
		const parsed = JSON.parse(e) as LambdaErrorInfo;

		return {
			...parsed,
			explanation: getExplanation(parsed.stack),
			s3Location: errs[index],
		};
	});
};
