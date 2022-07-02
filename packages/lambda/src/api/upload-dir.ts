import {PutObjectCommand} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import {createReadStream, promises as fs} from 'fs';
import mimeTypes from 'mime-types';
import path from 'path';
import type {Privacy} from '../defaults';
import type {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {makeS3Key} from '../shared/make-s3-key';

type FileInfo = {
	name: string;
	size: number;
};

export type UploadDirProgress = {
	totalFiles: number;
	filesUploaded: number;
	totalSize: number;
	sizeUploaded: number;
};

export type MockFile = {
	name: string;
	content: string;
};

export const getDirFiles = (entry: string): MockFile[] => {
	throw new TypeError(
		'should only be executed in test ' + JSON.stringify(entry)
	);
};

export const uploadDir = async ({
	bucket,
	region,
	dir,
	onProgress,
	folder,
	privacy,
}: {
	bucket: string;
	region: AwsRegion;
	dir: string;
	folder: string;
	onProgress: (progress: UploadDirProgress) => void;
	privacy: Privacy;
}) => {
	async function getFiles(directory: string): Promise<FileInfo[]> {
		const dirents = await fs.readdir(directory, {withFileTypes: true});
		const _files = await Promise.all(
			dirents.map(async (dirent) => {
				const res = path.resolve(directory, dirent.name);
				const {size} = await fs.stat(res);
				return dirent.isDirectory()
					? getFiles(res)
					: [
							{
								name: res,
								size,
							},
					  ];
			})
		);
		return _files.flat(1);
	}

	const files = await getFiles(dir);
	const progresses: {[key: string]: number} = {};
	for (const file of files) {
		progresses[file.name] = 0;
	}

	const client = getS3Client(region);

	const uploads = files.map(async (filePath) => {
		const Key = makeS3Key(folder, dir, filePath.name);
		const Body = createReadStream(filePath.name);
		const ContentType = mimeTypes.lookup(Key) || 'application/octet-stream';
		const ACL = privacy === 'private' ? 'private' : 'public-read';
		if (filePath.size > 5 * 1024 * 1024) {
			const paralellUploads3 = new Upload({
				client,
				queueSize: 4,
				partSize: 5 * 1024 * 1024,
				params: {
					Key,
					Bucket: bucket,
					Body,
					ACL,
					ContentType,
				},
			});
			paralellUploads3.on('httpUploadProgress', (progress) => {
				progresses[filePath.name] = progress.loaded ?? 0;
			});
			return paralellUploads3.done();
		}

		await client.send(
			new PutObjectCommand({
				Key,
				Bucket: bucket,
				Body,
				ACL,
				ContentType,
			})
		);
		progresses[filePath.name] = filePath.size;
	});
	const promise = Promise.all(uploads);

	const interval = setInterval(() => {
		onProgress({
			totalSize: files.map((f) => f.size).reduce((a, b) => a + b, 0),
			sizeUploaded: Object.values(progresses).reduce((a, b) => a + b, 0),
			totalFiles: files.length,
			filesUploaded: files.filter((f) => progresses[f.name] === f.size).length,
		});
	}, 1000);
	await promise;
	clearInterval(interval);
};
