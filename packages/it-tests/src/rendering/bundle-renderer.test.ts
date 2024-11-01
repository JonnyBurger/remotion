import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import esbuild from 'esbuild';
import {execSync} from 'node:child_process';
import {copyFileSync, cpSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {exampleVideos} from './example-videos';

test('Should be able to bundle the renderer', () => {
	const outputdir = path.join(tmpdir(), `test-${Math.random()}`);
	const outfile = path.join(outputdir, 'esbuild-test.js');

	const {errors, warnings} = esbuild.buildSync({
		platform: 'node',
		target: 'node16',
		bundle: true,
		outfile,
		entryPoints: [
			`${__dirname}${path.sep}..${path.sep}..${path.sep}test-index.ts`,
		],
	});
	expect(errors.length).toBe(0);
	expect(warnings.length).toBe(0);
	const binaryPath = RenderInternals.getExecutablePath({
		type: 'compositor',
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
	});
	const ffmpegCwd = path.dirname(binaryPath);
	const filesInCwd = readdirSync(ffmpegCwd);
	const filesToCopy = filesInCwd.filter(
		(f) =>
			f.startsWith('remotion') ||
			f.endsWith('.so') ||
			f.endsWith('.dll') ||
			f.endsWith('.dylib') ||
			f.startsWith('ffmpeg') ||
			f.startsWith('ffprobe'),
	);
	for (const file of filesToCopy) {
		cpSync(path.join(ffmpegCwd, file), path.join(outputdir, file));
	}

	copyFileSync(binaryPath, path.join(outputdir, path.basename(binaryPath)));
	cpSync(ffmpegCwd, path.join(outputdir, path.basename(ffmpegCwd)), {
		recursive: true,
	});

	const out = execSync('node ' + outfile + ' ' + exampleVideos.bigBuckBunny);
	expect(out.toString('utf8')).toBe('h264\n');

	rmSync(outputdir, {
		recursive: true,
	});
});
