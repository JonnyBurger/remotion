import {AwsRegion} from '../pricing/aws-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {createBucket} from './create-bucket';
import {getRemotionS3Buckets} from './get-buckets';

type GetOrCreateBucketInput = {
	region: AwsRegion;
};

type GetOrCreateBucketResult = {
	bucketName: string;
};
/**
 * @description Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.
 * @link http://remotion.dev/docs/lambda/getorcreatebucket
 * @param options.region The region in which you want your S3 bucket to reside in.
 * @returns `Promise<{region: AwsRegion}>`
 */
export const getOrCreateBucket = async (
	options: GetOrCreateBucketInput
): Promise<GetOrCreateBucketResult> => {
	const {remotionBuckets} = await getRemotionS3Buckets(options.region);
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.Name
			)}) in your S3 region (${
				options.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`
		);
	}

	if (remotionBuckets.length === 1) {
		return {bucketName: remotionBuckets[0].Name as string};
	}

	const bucketName = REMOTION_BUCKET_PREFIX + randomHash();

	await createBucket({
		bucketName,
		region: options.region,
	});

	return {bucketName};
};
