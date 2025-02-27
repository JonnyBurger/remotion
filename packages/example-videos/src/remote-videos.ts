/* eslint-disable no-console */
import {$} from 'bun';
import fs from 'fs';
import path from 'path';

export const remoteExampleVideos = {
	mp4av1:
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/mp4-av1.mp4',
	fragmentedMoofTrickyDuration:
		'https://remotion-video-submissions.s3.ap-northeast-1.amazonaws.com/6048e3e4-ffbb-43a5-b6b5-75643365646a',
	webmNoCodecPrivate:
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/webm-no-codecprivate.webm',
};

const rootDir = path.join(__dirname, '..');
const cacheDir = path.join(rootDir, 'node_modules', '.videos');

export const getRemoteExampleVideo = async (
	videoName: keyof typeof remoteExampleVideos,
) => {
	const url = remoteExampleVideos[videoName];
	const name = new URL(url).pathname.split('/').pop() as string;
	const location = path.join(cacheDir, name);

	if (!fs.existsSync(location)) {
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, {
				recursive: true,
			});
		}

		console.log('Downloading video', url);
		console.time(`Download ${url}`);
		await $`curl -o ${location} ${url}`;
		console.timeEnd(`Download ${url}`);
	}

	return location;
};
