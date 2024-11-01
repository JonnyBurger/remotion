import {describe, expect, test} from 'bun:test';
import esbuild from 'esbuild';
import fs from 'fs';
import {tmpdir} from 'os';
import path from 'path';

test('Should not be able to bundle @remotion/cloudrun directly', async () => {
	expect(() =>
		esbuild.build({
			platform: 'node',
			target: 'node16',
			bundle: true,
			entryPoints: [require.resolve('@remotion/cloudrun')],
			logLevel: 'silent',
		}),
	).toThrow(/Could not resolve "@swc\/wasm"/);
});

describe('Should be able to bundle @remotion/cloudrun/client with ESBuild', () => {
	const outfile = path.join(tmpdir(), 'esbuild-test.js');

	test('Should build without errors', async () => {
		const {errors, warnings} = await esbuild.build({
			platform: 'node',
			target: 'node16',
			bundle: true,
			outfile,
			entryPoints: [require.resolve('@remotion/cloudrun/client')],
		});
		expect(errors.length).toBe(0);
		expect(warnings.length).toBe(0);

		// Should not include remotion, but currently does react
		const contents = fs.readFileSync(outfile, 'utf-8');
		expect(contents.includes('getRemotionEnvironment')).toBe(false);
	});

	test('Bundle should be below 7MB', async () => {
		const file = await fs.promises.readFile(outfile, 'utf-8');
		expect(file.length).toBeGreaterThan(10000);
		expect(file.length).toBeLessThanOrEqual(7_000_000);
	});

	test('Bundle should not include Renderer', async () => {
		const file = await fs.promises.readFile(outfile, 'utf-8');
		expect(file).not.toContain('@remotion/renderer');
	});

	test('Should be able to delete it', () => {
		fs.unlinkSync(outfile);
	});
});
