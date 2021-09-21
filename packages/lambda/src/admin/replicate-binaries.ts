import {
	CreateBucketCommand,
	GetBucketLocationCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {createReadStream} from 'fs';
import path from 'path';
import {AwsRegion, AWS_REGIONS} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {getBinariesBucketName} from '../shared/constants';

const bucketExistsInRegion = async ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: AwsRegion;
}) => {
	try {
		const bucket = await getS3Client(region).send(
			new GetBucketLocationCommand({
				Bucket: bucketName,
			})
		);

		return (bucket.LocationConstraint ?? 'us-east-1') === region;
	} catch (err) {
		if ((err as {Code: string}).Code === 'NoSuchBucket') {
			return false;
		}

		throw err;
	}
};

CliInternals.xns(async () => {
	for (const region of AWS_REGIONS) {
		Log.info('Region:', region);
		const client = getS3Client(region);
		const bucketName = getBinariesBucketName(region);

		const bucketExists = await bucketExistsInRegion({bucketName, region});
		if (!bucketExists) {
			await client.send(
				new CreateBucketCommand({
					ACL: 'public-read',
					Bucket: bucketName,
				})
			);
			Log.info(`Bucket ${bucketName} created.`);
		}

		const Body = createReadStream(path.join(__dirname, 'remotion.zip'));

		Log.info(`Uploading ${region}...`);
		await client.send(
			new PutObjectCommand({
				Key: 'remotion.zip',
				Bucket: bucketName,
				Body,
				ACL: 'public-read',
			})
		);
	}
});
