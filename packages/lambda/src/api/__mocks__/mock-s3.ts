import {AwsRegion} from '../../../dist';
import {LambdaAcl} from '../../defaults';

type S3MockFile = {
	bucketName: string;
	region: AwsRegion;
	acl: LambdaAcl;
	key: string;
	content: string;
};

let mockS3Store: S3MockFile[] = [];

export const mockS3Upload = (file: S3MockFile) => {
	mockS3Store.push(file);
};

export const getS3FilesInBucket = ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: string;
}) => {
	return mockS3Store.filter(
		(s) => s.bucketName === bucketName && s.region === region
	);
};

export const mockDeleteS3File = ({
	key,
	region,
	bucketName,
}: {
	key: string;
	region: AwsRegion;
	bucketName: string;
}) => {
	mockS3Store = mockS3Store.filter(
		(s) =>
			!(s.bucketName === bucketName && s.key === key && s.region === region)
	);
};
