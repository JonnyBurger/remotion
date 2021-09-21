import {bucketExistsInRegion as original} from '../bucket-exists';
import {mockBucketExists} from './mock-store';

export const bucketExistsInRegion: typeof original = (input) => {
	return Promise.resolve(mockBucketExists(input.bucketName, input.region));
};
