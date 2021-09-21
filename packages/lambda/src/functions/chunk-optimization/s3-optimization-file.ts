import {AwsRegion} from '../../pricing/aws-regions';
import {optimizationProfile} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaLs, lambdaReadFile, lambdaWriteFile} from '../helpers/io';
import {OptimizationProfile} from './types';

export const writeOptimization = async ({
	bucketName,
	optimization,
	compositionId,
	siteId,
	region,
	expectedBucketOwner,
}: {
	bucketName: string;
	optimization: OptimizationProfile;
	compositionId: string;
	siteId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(optimization),
		key: optimizationProfile(siteId, compositionId) + '.json',
		region,
		acl: 'private',
		expectedBucketOwner,
	});
};

export const getOptimization = async ({
	siteId,
	compositionId,
	bucketName,
	region,
	expectedBucketOwner,
}: {
	bucketName: string;
	siteId: string;
	compositionId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}): Promise<OptimizationProfile | null> => {
	const prefix = optimizationProfile(siteId, compositionId);
	const dir = await lambdaLs({
		bucketName,
		prefix,
		region,
		expectedBucketOwner,
	});
	const files = dir
		.sort(
			(a, b) =>
				(a.LastModified?.getTime() as number) -
				(b.LastModified?.getTime() as number)
		)
		.reverse();
	if (files.length === 0) {
		return null;
	}

	const body = await lambdaReadFile({
		bucketName,
		key: files[0].Key as string,
		region,
		expectedBucketOwner,
	});

	const str = await streamToString(body);

	return JSON.parse(str) as OptimizationProfile;
};
