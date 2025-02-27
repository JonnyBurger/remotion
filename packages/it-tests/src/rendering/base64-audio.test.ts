import {RenderInternals} from '@remotion/renderer';
import {afterEach, beforeEach, expect, test} from 'bun:test';
import execa from 'execa';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(process.cwd(), 'packages/example/out.mp3');

beforeEach(() => {
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}
});
afterEach(() => {
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}
});

test(
	'Should be able to render a MP3 audio file',
	async () => {
		const task = execa(
			'bun',
			['x', 'remotion', 'render', 'audio-testing-base64', outputPath],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		task.stderr?.pipe(process.stderr);
		await task;
		const exists = fs.existsSync(outputPath);
		expect(exists).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [outputPath],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(data).toContain('mp3');
		expect(data).toContain('stereo');
		expect(data).toContain('320 kb/s');
		expect(data).toContain('Stream #0');
		expect(data).not.toContain('Stream #1');
		fs.unlinkSync(outputPath);
	},
	{timeout: 30000},
);
