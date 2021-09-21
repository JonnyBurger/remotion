import {CreateBucketCommand} from '@aws-sdk/client-s3';
import {AwsRegion} from '..';
import {getS3Client} from '../shared/aws-clients';

export const createBucket = async ({
	region,
	bucketName,
}: {
	region: AwsRegion;
	bucketName: string;
}) => {
	await getS3Client(region).send(
		new CreateBucketCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
};
