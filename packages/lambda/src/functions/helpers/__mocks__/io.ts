import {_Object} from '@aws-sdk/client-s3';
import {getS3FilesInBucket} from '../../../api/__mocks__/mock-s3';
import {LambdaLSInput, LambdaLsReturnType} from '../io';

export const lambdaLs = async (
	input: LambdaLSInput
): Promise<LambdaLsReturnType> => {
	if (!input) {
		throw new Error('need to pass input');
	}

	const files = getS3FilesInBucket({
		bucketName: input.bucketName,
		region: input.region,
	});
	return files
		.filter((p) => p.key.startsWith(input.prefix))
		.map((file): _Object => {
			return {
				Key: file.key,
				ETag: undefined,
				LastModified: new Date(0),
				Owner: undefined,
				Size: file.content.length,
				StorageClass: undefined,
			};
		});
};
