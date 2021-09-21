import {getRemotionS3Buckets as original} from '../get-buckets';
import {getMockBuckets} from './mock-store';

export const getRemotionS3Buckets = (): ReturnType<typeof original> => {
	return Promise.resolve({
		remotionBuckets: getMockBuckets(),
	});
};
