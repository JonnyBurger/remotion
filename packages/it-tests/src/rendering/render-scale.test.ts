import {RenderInternals} from '@remotion/renderer';
import {afterEach, beforeEach, expect, test} from 'bun:test';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {NoReactInternals} from 'remotion/no-react';

const outputPath = path.join(process.cwd(), 'packages/example/out.mp4');

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
	'Should be able to render video with scale 2',
	async () => {
		const task = execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'src/index.ts',
				'ten-frame-tester',
				'--frames',
				'0-1',
				'--codec',
				'h264',
				'--scale',
				'2',
				outputPath,
			],
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
		expect(data).toContain('Video: h264');
		if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
			expect(data).toContain('yuv420p');
		} else {
			expect(data).toContain('yuvj420p');
		}
		expect(data).toContain('2160x2160');
		expect(data).toContain('30 fps');
	},
	{
		timeout: 30000,
	},
);

test(
	'Should be able to render video with scale 0.1',
	async () => {
		const task = execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'src/index.ts',
				'ten-frame-tester',
				'--frames',
				'0-1',
				'--codec',
				'h264',
				'--scale',
				'0.1',
				outputPath,
			],
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
		expect(data).toContain('Video: h264');
		if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
			expect(data).toContain('yuv420p');
		} else {
			expect(data).toContain('yuvj420p');
		}
		expect(data).toContain('108x108');
		expect(data).toContain('30 fps');
	},
	{
		timeout: 30000,
	},
);
