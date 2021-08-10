import {createFFmpeg} from '@ffmpeg/ffmpeg';
import execa from 'execa';
import fs from 'fs';

export const ENABLE_WASM_FFMPEG = true;

export const wasmFfmpeg = createFFmpeg({log: true});
export const load = wasmFfmpeg.load();

export const runFfmpegCommand = async (
	args: string[],
	isRenderBad: boolean,
	options?: execa.Options
) => {
	await load;

	await wasmFfmpeg.run(...args);
	if (isRenderBad) {
		await fs.promises.writeFile(
			'./hi.mp4',
			// eslint-disable-next-line new-cap
			wasmFfmpeg.FS('readFile', 'hi.mp4')
		);
	}

	console.log('wasm done');
	return execa('ffmpeg', args, options);
};
