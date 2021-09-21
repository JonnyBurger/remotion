import {BucketWithLocation} from '../get-buckets';

export const mockBucketStore: BucketWithLocation[] = [];

export const addMockBucket = (bucket: BucketWithLocation) => {
	mockBucketStore.push(bucket);
};

export const getMockBuckets = () => {
	return mockBucketStore;
};

export const mockBucketExists = (bucketName: string, region: string) => {
	return Boolean(
		mockBucketStore.find((s) => s.Name === bucketName && s.region === region)
	);
};
