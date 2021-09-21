import {createBucket as original} from '../create-bucket';
import {addMockBucket} from './mock-store';

export const createBucket: typeof original = (input) => {
	addMockBucket({
		region: input.region,
		CreationDate: new Date(0),
		Name: input.bucketName,
	});
	return Promise.resolve();
};
