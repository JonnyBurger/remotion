// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {rmdirSync, rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {Codec, Internals} from 'remotion';
import {getAudioCodecName} from './get-audio-codec-name';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';

export const combineVideos = async ({
	files,
	filelistDir,
	output,
	onProgress,
	numberOfFrames,
	codec,
}: {
	files: string[];
	filelistDir: string;
	output: string;
	onProgress: (p: number) => void;
	numberOfFrames: number;
	codec: Codec;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'files.txt');
	writeFileSync(fileListTxt, fileList);

	try {
		const task = execa(
			'ffmpeg',
			[
				'-f',
				'concat',
				'-safe',
				'0',
				'-i',
				fileListTxt,
				Internals.isAudioCodec(codec) ? null : '-c:v',
				Internals.isAudioCodec(codec) ? null : 'copy',
				'-c:a',
				Internals.isAudioCodec(codec) ? getAudioCodecName(codec) : 'aac',
				'-shortest',
				'-y',
				output,
			].filter(Internals.truthy)
		);
		task.stderr?.on('data', (data: Buffer) => {
			if (onProgress) {
				const parsed = parseFfmpegProgress(data.toString());
				if (parsed !== undefined) {
					onProgress(parsed);
				}
			}
		});

		await task;
		onProgress(numberOfFrames);
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
	} catch (err) {
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
		throw err;
	}
};
