import {cleanItems as original} from '../clean-items';
import {mockDeleteS3File} from './mock-s3';

export const cleanItems: typeof original = (input) => {
	for (const item of input.list) {
		input.onBeforeItemDeleted?.({
			bucketName: input.bucket,
			itemName: item,
		});
		mockDeleteS3File({
			key: item,
			bucketName: input.bucket,
			region: input.region,
		});
		input.onAfterItemDeleted?.({
			bucketName: input.bucket,
			itemName: item,
		});
	}

	return Promise.resolve([]);
};
