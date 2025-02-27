import {
	RenderInternals,
	renderMedia,
	renderStill,
	selectComposition,
	StillImageFormat,
} from '@remotion/renderer';
import {$} from 'bun';
import {beforeAll, expect, test} from 'bun:test';
import {execSync} from 'node:child_process';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

if (process.platform === 'win32') {
	process.exit(0);
}

const exampleDir = path.join(__dirname, '..', '..');

beforeAll(async () => {
	await $`bunx remotion browser ensure`.cwd(exampleDir);
	await $`bunx remotion bundle`.cwd(exampleDir);
});

test(
	'Can render a still png using Node.JS APIs',
	async () => {
		const composition = await selectComposition({
			serveUrl: path.join(exampleDir, 'build'),
			id: 'react-svg',
			inputProps: {},
		});

		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');
		const testOut = path.join(folder, 'still.png');

		const fileOSRoot = path.parse(__dirname).root;

		await expect(
			renderStill({
				composition,
				output: testOut,
				serveUrl: path.join(exampleDir, 'build'),
				frame: 500,
			}),
		).rejects.toThrow(
			/Cannot use frame 500: Duration of composition is 300, therefore the highest frame that can be rendered is 299/,
		);

		await expect(
			renderStill({
				composition,
				output: process.platform === 'win32' ? fileOSRoot : '/var',
				serveUrl: path.join(exampleDir, 'build'),
			}),
		).rejects.toThrow(/already exists, but is not a file/);

		await expect(
			renderStill({
				composition,
				output: 'src/index.ts',
				serveUrl: path.join(exampleDir, 'build'),
				overwrite: false,
			}),
		).rejects.toThrow(
			/Cannot render still - "overwrite" option was set to false, but the output/,
		);

		await renderStill({
			composition,
			output: testOut,
			serveUrl: path.join(exampleDir, 'build'),
			frame: 100,
		});

		expect(existsSync(testOut)).toBe(true);
		unlinkSync(testOut);
		RenderInternals.deleteDirectory(folder);
	},
	{
		retry: 3,
		timeout: 90000,
	},
);

test(
	'Can render a still pdf using Node.JS APIs',
	async () => {
		const imageFormat: StillImageFormat = 'pdf';
		const folder = path.join(tmpdir(), 'remotion-test', 'render-still');

		const composition = await selectComposition({
			serveUrl: path.join(exampleDir, 'build'),
			id: 'tiles',
			inputProps: {},
		});

		const testOut = path.join(folder, `edgecase.${imageFormat}`);

		await renderStill({
			composition,
			output: testOut,
			serveUrl: path.join(exampleDir, 'build'),
			frame: 15,
			imageFormat,
		});

		expect(existsSync(testOut)).toBe(true);
		unlinkSync(testOut);

		RenderInternals.deleteDirectory(folder);
	},
	{
		retry: 3,
		timeout: 90000,
	},
);

test('Bt709 encoding should work', async () => {
	const composition = await selectComposition({
		serveUrl: path.join(exampleDir, 'build'),
		id: 'green',
		inputProps: {},
	});

	const still = await renderStill({
		composition,
		serveUrl: path.join(exampleDir, 'build'),
	});

	const img = await sharp(still.buffer as Buffer)
		.raw()
		.toBuffer();
	const actualColor = {
		red: img.readUInt8(0),
		green: img.readUInt8(1),
		blue: img.readUInt8(2),
	};

	expect(actualColor.blue).toBe(0);
	expect(actualColor.green).toBe(128);
	expect(actualColor.blue).toBe(0);

	const {buffer} = await renderMedia({
		codec: 'h264',
		composition,
		imageFormat: 'png',
		serveUrl: path.join(exampleDir, 'build'),
		muted: true,
	});

	writeFileSync('out.mp4', new Uint8Array(buffer as Buffer));

	execSync('bunx remotion ffmpeg -i - -frames:v 1 -c:v png out%02d.png', {
		input: new Uint8Array(buffer as Buffer),
		stdio: ['pipe', 'ignore', 'ignore'],
	});

	const pngBuffer = readFileSync('out01.png');

	const frameImg = await sharp(pngBuffer).raw().toBuffer();
	const actualColorFrame = {
		red: frameImg.readUInt8(0),
		green: frameImg.readUInt8(1),
		blue: frameImg.readUInt8(2),
	};
	expect(actualColorFrame.blue).toBe(0);
	expect(actualColorFrame.green).toBeGreaterThanOrEqual(126);
	expect(actualColorFrame.green).toBeLessThanOrEqual(128);
	expect(actualColorFrame.blue).toBe(0);

	unlinkSync('out01.png');
	unlinkSync('out.mp4');
});
