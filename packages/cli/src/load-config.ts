import fs from 'fs';
import os from 'os';
import path from 'path';
import {Log} from './log';
import esbuild = require('esbuild');

export const loadConfigFile = async (
	configFileName: string,
	isJavascript: boolean
): Promise<string | null> => {
	const resolved = path.resolve(process.cwd(), configFileName);

	const tsconfigJson = path.join(process.cwd(), 'tsconfig.json');
	if (!isJavascript && !fs.existsSync(tsconfigJson)) {
		Log.error(
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/remotion-dev/template/blob/main/tsconfig.json.'
		);
		process.exit(1);
	}

	const out = path.join(
		await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-')),
		'bundle.js'
	);
	const result = await esbuild.build({
		platform: 'node',
		target: 'node12',
		bundle: true,
		entryPoints: [resolved],
		tsconfig: isJavascript ? undefined : tsconfigJson,
		absWorkingDir: process.cwd(),
		outfile: out,
		external: ['remotion'],
	});
	if (result.errors.length > 0) {
		Log.error('Error in remotion.config.ts file');
		for (const err in result.errors) {
			Log.error(err);
		}

		process.exit(1);
	}

	const file = await fs.promises.readFile(out, 'utf8');

	// eslint-disable-next-line no-eval
	eval(file);

	await fs.promises.unlink(out);
	return resolved;
};
