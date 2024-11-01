import {dir} from '@remotion/compositor-linux-x64-gnu';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

export const bundleRenderLogic = async () => {
	const outdir = path.join(__dirname, '../../container/dist');
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	(fs.rmSync ?? fs.rmdirSync)(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = require.resolve(path.join(__dirname, '../functions/index'));

	await esbuild.build({
		platform: 'node',
		target: 'node18',
		bundle: true,
		outfile,
		entryPoints: [template],
		treeShaking: true,
		external: ['./remotion', './remotion.exe', './mappings.wasm'],
	});

	const filesInCwd = fs.readdirSync(dir);
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
		fs.cpSync(path.join(dir, file), path.join(outdir, file));
	}

	fs.cpSync(
		path.join(
			__dirname,
			'..',
			'..',
			'..',
			'renderer',
			'node_modules',
			'source-map',
			'lib',
			'mappings.wasm',
		),
		`${outdir}/mappings.wasm`,
	);

	console.log('distribution bundled.');
};
