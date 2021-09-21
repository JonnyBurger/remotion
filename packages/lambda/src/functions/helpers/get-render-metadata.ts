import {AwsRegion} from '../../pricing/aws-regions';
import {RenderMetadata, renderMetadataKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getRenderMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId),
		region,
		expectedBucketOwner,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body)
	) as RenderMetadata;

	return renderMetadataResponse;
};
