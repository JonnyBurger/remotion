import {enableS3Website as original} from '../enable-s3-website';

// TODO: Add bucket exists check
export const enableS3Website: typeof original = () => {
	return Promise.resolve();
};
