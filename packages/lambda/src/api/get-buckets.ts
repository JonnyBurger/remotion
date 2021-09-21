import {
	Bucket,
	GetBucketLocationCommand,
	ListBucketsCommand,
} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';

export type BucketWithLocation = Bucket & {
	region: AwsRegion;
};

// TODO: In the CLI, warn everytime this function gets called about more than 1 bucket.
export const getRemotionS3Buckets = async (
	region: AwsRegion
): Promise<{
	remotionBuckets: BucketWithLocation[];
}> => {
	const {Buckets} = await getS3Client(region).send(new ListBucketsCommand({}));
	if (!Buckets) {
		return {remotionBuckets: []};
	}

	const remotionBuckets = Buckets.filter(
		(b) =>
			b.Name?.startsWith(REMOTION_BUCKET_PREFIX) &&
			// TODO: Rename other buckets in Jonnys account bucket first
			!b.Name.startsWith('remotion-binaries')
	);

	const locations = await Promise.all(
		remotionBuckets.map((bucket) => {
			return getS3Client(region).send(
				new GetBucketLocationCommand({
					Bucket: bucket.Name as string,
				})
			);
		})
	);

	const bucketsWithLocation = remotionBuckets.map(
		(bucket, i): BucketWithLocation => {
			return {
				...bucket,
				// AWS docs: Buckets in Region us-east-1 have a LocationConstraint of null!!
				region: (locations[i].LocationConstraint ?? 'us-east-1') as AwsRegion,
			};
		}
	);
	return {
		remotionBuckets: bucketsWithLocation.filter((bucket) => {
			return bucket.region === region;
		}),
	};
};
