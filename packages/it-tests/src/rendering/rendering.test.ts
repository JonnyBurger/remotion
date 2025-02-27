import {RenderInternals} from '@remotion/renderer';
import {afterEach, beforeAll, beforeEach, expect, test} from 'bun:test';
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import {NoReactInternals} from 'remotion/no-react';

const outputPath = path.join(process.cwd(), 'packages/example/out.mp4');

beforeAll(async () => {
	/**
	 * Before running any of these tests, we should bundle the example project. In the CI, this is already done.
	 */
	if (process.env.CI) {
		return;
	}
	await execa('bun', ['x', 'remotion', 'bundle'], {
		cwd: path.join(process.cwd(), '..', 'example'),
	});
});

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
	'Should be able to render video with custom port',
	async () => {
		const task = execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'build',
				'ten-frame-tester',
				'--codec',
				'h264',
				'--color-space=bt709',
				'--port=3536',
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
		expect(data).toContain('yuv420p');
		expect(data).toContain('1080x1080');
		expect(data).toContain('bt709');
		expect(data).toContain('30 fps');
		expect(data).toContain('Audio: aac');
	},
	{
		timeout: 30000,
	},
);

test(
	'Should fail to render out of range CRF',
	async () => {
		const task = await execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'build',

				'ten-frame-tester',
				'--codec',
				'vp8',
				// Range of VP8 values is 4-63
				'--crf',
				'3',
				outputPath.replace('mp4', 'webm'),
			],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
				reject: false,
			},
		);
		expect(task.exitCode).toBe(1);
		expect(task.stderr).toContain('CRF must be between ');
	},
	{
		timeout: 30000,
	},
);

test('Should fail to render out of range frame when range is a number', async () => {
	const out = outputPath.replace('.mp4', '');

	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'render',
			'build',

			'ten-frame-tester',
			'--sequence',
			'--frames=10',
			out,
		],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
			reject: false,
		},
	);
	expect(task.exitCode).toBe(1);
	expect(task.stderr).toContain(
		'Frame number is out of range, must be between 0 and 9',
	);
});

test('Should fail to render out of range frame when range is a string', async () => {
	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'render',
			'build',

			'ten-frame-tester',
			'--frames=2-10',
			outputPath,
		],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
			reject: false,
		},
	);
	expect(task.exitCode).toBe(1);
	expect(task.stderr).toContain('frame range 2-10 is not inbetween 0-9');
});

test(
	'Should render a ProRes video',
	async () => {
		const out = outputPath.replace('.mp4', '.mov');
		const task = await execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'build',
				'ten-frame-tester',
				'--prores-profile=4444',
				out,
			],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
				reject: false,
			},
		);
		expect(task.exitCode).toBe(0);

		const exists = fs.existsSync(out);
		expect(exists).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(
			data.includes('prores (4444)') || data.includes('prores (ap4h'),
		).toBe(true);
		fs.unlinkSync(out);
	},
	{
		timeout: 30000,
	},
);

test('Should render a still image if single frame specified', async () => {
	const outDir = outputPath.replace('.mp4', '');
	const outImg = path.join(outDir, 'element-2.png');
	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'render',
			'build',
			'ten-frame-tester',
			'--frames=2',
			outDir,
		],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
			reject: false,
		},
	);
	expect(task.exitCode).toBe(0);
	expect(fs.existsSync(outImg)).toBe(true);

	const info = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [outImg],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	const data = info.stderr;
	expect(data).toContain('Video: png');
	await fs.promises.rm(outDir, {
		recursive: true,
	});
});

test(
	'Should be able to render a WAV audio file',
	async () => {
		const out = outputPath.replace('mp4', 'wav');
		const task = execa(
			'bun',
			['x', 'remotion', 'render', 'build', 'audio-testing', out],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		task.stderr?.pipe(process.stderr);
		await task;
		const exists = fs.existsSync(out);
		expect(exists).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(data).toContain('pcm_s16le');
		expect(data).toContain('2 channels');
		expect(data).toContain('Kevin MacLeod');
		expect(data).toMatch(/bitrate: 15\d\d kb/);
		expect(data).toContain('Stream #0');
		expect(data).not.toContain('Stream #1');
		fs.unlinkSync(out);
	},
	{
		timeout: 30000,
	},
);

test(
	'Should be able to render a MP3 audio file',
	async () => {
		const out = outputPath.replace('mp4', 'mp3');
		const task = execa(
			'bun',
			['x', 'remotion', 'render', 'build', 'audio-testing', out],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		task.stderr?.pipe(process.stderr);
		await task;
		const exists = fs.existsSync(out);
		expect(exists).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(data).toContain('mp3');
		expect(data).toContain('stereo');
		expect(data).toContain('Kevin MacLeod');
		expect(data).toContain('320 kb/s');
		expect(data).toContain('Stream #0');
		expect(data).not.toContain('Stream #1');
		fs.unlinkSync(out);
	},
	{timeout: 30000},
);

test(
	'Should be able to render a AAC audio file',
	async () => {
		const out = outputPath.replace('mp4', 'aac');
		const task = execa(
			'bun',
			['x', 'remotion', 'render', 'build', 'audio-testing', out],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		task.stderr?.pipe(process.stderr);
		await task;
		const exists = fs.existsSync(out);
		expect(exists).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(data).toContain('aac');
		expect(data).toContain('stereo');
		expect(data).not.toContain('Kevin MacLeod');
		expect(data).toMatch(/\d?\d kb\/s/);
		expect(data).toContain('Stream #0');
		expect(data).not.toContain('Stream #1');
		fs.unlinkSync(out);
	},
	{
		timeout: 30000,
	},
);

test(
	'Should render a video with GIFs',
	async () => {
		const task = await execa(
			'bun',
			['x', 'remotion', 'render', 'build', 'gif', '--frames=0-47', outputPath],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		expect(task.exitCode).toBe(0);
		expect(fs.existsSync(outputPath)).toBe(true);

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
			expect(data).toContain('bt709');
		} else {
			expect(data).not.toContain('bt709');
		}
		expect(data).toContain('Duration: 00:00:01.64');

		fs.unlinkSync(outputPath);
	},
	{
		timeout: 30000,
	},
);

test(
	'Should render a video with Offline Audio-context',
	async () => {
		const out = outputPath.replace('.mp4', '.mp3');

		const task = await execa(
			'bun',
			['x', 'remotion', 'render', 'build', 'offline-audio-buffer', out],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);
		expect(task.exitCode).toBe(0);
		expect(fs.existsSync(out)).toBe(true);

		const info = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [out],
			indent: false,
			logLevel: 'info',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const data = info.stderr;
		expect(data).toContain('Stream #0:0: Audio: mp3');
		expect(data).toContain('48000 Hz, stereo');
		fs.unlinkSync(out);
	},
	{
		timeout: 30000,
	},
);

test("Should succeed to render an audio file that doesn't have any audio inputs", async () => {
	const out = outputPath.replace('.mp4', '.mp3');
	const task = await execa(
		'bun',
		['x', 'remotion', 'render', 'build', 'ten-frame-tester', out],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
		},
	);
	expect(task.exitCode).toBe(0);
	const info = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [out],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	const data = info.stderr;
	expect(data).toContain('Duration: 00:00:00.36');
	expect(data).toContain('Audio: mp3, 48000 Hz');
	fs.unlinkSync(out);
});

test('Should render a still that uses the staticFile() API and should apply props', async () => {
	const out = outputPath.replace('.mp4', '.png');
	const props = JSON.stringify({flag: true});
	const cwd = path.join(process.cwd(), '..', 'example');
	await Bun.write(path.join(cwd, 'props.json'), props);
	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'still',
			'build',
			'static-demo',
			out,
			'--log=verbose',
			`--props`,
			'props.json',
		],
		{
			cwd,
			// @ts-expect-error staticfile
			env: {
				REMOTION_FLAG: 'hi',
			},
		},
	);
	await Bun.file(path.join(cwd, 'props.json')).delete();
	expect(task.exitCode).toBe(0);
	fs.unlinkSync(out);
});

test('Dynamic duration should work and audio separation', async () => {
	const audio = path.join(process.cwd(), '..', 'example', 'audio.wav');

	const randomDuration = Math.round(Math.random() * 18 + 2);
	const props = JSON.stringify({duration: randomDuration, offthread: true});
	const cwd = path.join(process.cwd(), '..', 'example');
	await Bun.file(path.join(cwd, 'props.json')).write(props);
	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'render',
			'build',
			'dynamic-duration',
			`--props`,
			'props.json',
			'--separate-audio-to',
			'audio.wav',
			outputPath,
		],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
		},
	);
	await Bun.file(path.join(cwd, 'props.json')).delete();

	expect(task.exitCode).toBe(0);
	expect(fs.existsSync(outputPath)).toBe(true);

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
	const expectedDuration = (randomDuration / 30).toFixed(2);
	expect(data).toContain(`Duration: 00:00:0${expectedDuration}`);
	if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
		expect(data).toContain(
			`Stream #0:0[0x1](und): Video: h264 (avc1 / 0x31637661), yuv420p(tv, bt709, progressive)`,
		);
	} else {
		expect(data).toContain(
			`Stream #0:0[0x1](und): Video: h264 (avc1 / 0x31637661), yuvj420p(pc, bt470bg/unknown/unknown, progressive)`,
		);
	}

	fs.unlinkSync(outputPath);

	const audioInfo = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [audio],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	const audioData = audioInfo.stderr;
	expect(audioData).toContain(
		'  Stream #0:0: Audio: pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 2 channels, s16',
	);
	fs.unlinkSync(audio);
});

test(
	'Should be able to render if remotion.config.js is not provided, and separate audio',
	async () => {
		const task = await execa(
			'node',
			[
				'packages/cli/remotion-cli.js',
				'render',
				'packages/example/src/entry.jsx',
				'framer',
				outputPath,
			],
			{
				cwd: path.join(process.cwd(), '..', '..'),
			},
		);

		expect(task.exitCode).toBe(0);
		fs.unlinkSync(outputPath);
	},
	{
		timeout: 30000,
	},
);

test(
	'Should be able to render if remotion.config.ts is not provided',
	async () => {
		const task = await execa(
			'node',
			[
				'packages/cli/remotion-cli.js',
				'render',
				'packages/example/src/ts-entry.tsx',

				'framer',
				'--public-dir=packages/example/public',
				outputPath,
			],
			{
				cwd: path.join(process.cwd(), '..', '..'),
			},
		);

		expect(task.exitCode).toBe(0);
		fs.unlinkSync(outputPath);
	},
	{
		timeout: 30000,
	},
);

test('Should be able to render a huge payload that gets serialized', async () => {
	const task = await execa(
		'bun',
		[
			'x',
			'remotion',
			'still',
			'build',
			'huge-payload',
			outputPath.replace('.mp4', '.png'),
		],
		{
			cwd: path.join(process.cwd(), '..', 'example'),
		},
	);

	expect(task.exitCode).toBe(0);
	fs.unlinkSync(outputPath.replace('.mp4', '.png'));
});

test(
	'If timeout, the error should be shown',
	async () => {
		const task = await execa(
			'bun',
			[
				'x',
				'remotion',
				'render',
				'build',
				'Timeout',
				outputPath,
				'--timeout=7000',
			],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
				reject: false,
			},
		);

		expect(task.exitCode).toBe(1);
		expect(task.stderr).toContain('This error should appear');
	},
	{
		timeout: 30000,
	},
);

test(
	'Should be able to call pnpm exec compositions',
	async () => {
		const task = await execa(
			'bun',
			['x', 'remotion', 'compositions', 'build'],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
				reject: false,
			},
		);

		expect(task.stdout).toContain('The following compositions');
	},
	{
		timeout: 30000,
	},
);

test(
	'Should be able to render video that was wrapped in context',
	async () => {
		await execa(
			'bun',
			['x', 'remotion', 'still', 'build', 'wrapped-in-context', outputPath],
			{
				cwd: path.join(process.cwd(), '..', 'example'),
			},
		);

		const exists = fs.existsSync(outputPath);
		expect(exists).toBe(true);
	},
	{
		timeout: 30000,
	},
);
