import type {MockFile, uploadDir as original} from '../upload-dir';
import {mockS3Upload} from './mock-s3';

export const getDirFiles = (dir: string): MockFile[] => {
	if (dir === '/path/to/bundle-1') {
		return [
			{
				name: 'bundle.js',
				content: 'console.log("Hello World")',
			},
			{
				name: 'styles.css',
				content: 'body {background: red}',
			},
		];
	}

	if (dir === '/path/to/bundle-2') {
		return [
			{
				name: 'bundle.js',
				content: 'console.log("Hello World")',
			},
			{
				name: 'styles2.css',
				content: 'body {background: red}',
			},
		];
	}

	throw new Error('could not get dir for ' + dir);
};

export const uploadDir: typeof original = async (input) => {
	const files = getDirFiles(input.dir);
	for (const file of files) {
		mockS3Upload({
			acl:
				input.privacy === 'no-acl'
					? 'none'
					: input.privacy === 'private'
					? 'private'
					: 'public-read',
			bucketName: input.bucket,
			content: file.content,
			// Should not use path.join here because on Windows it's not / separator
			key: [input.folder, file.name].join('/'),
			region: input.region,
		});
	}

	return Promise.resolve();
};
