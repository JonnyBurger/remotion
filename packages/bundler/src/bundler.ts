import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import {promisify} from 'util';
import webpack from 'webpack';
import {webpackConfig} from './webpack-config';

const entry = require.resolve('./renderEntry');

const promisified = promisify(webpack);

const prepareOutDir = async (specified: string | null) => {
	if (specified) {
		await fs.promises.mkdir(specified, {recursive: true});
		return specified;
	}

	return fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-graphics'));
};

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		outDir?: string;
		enableCaching?: boolean;
		publicPath?: string;
	}
): Promise<string> => {
	const outDir = await prepareOutDir(options?.outDir ?? null);
	const output = await promisified([
		webpackConfig({
			entry,
			userDefinedComponent: entryPoint,
			outDir,
			environment: 'production',
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			onProgressUpdate,
			enableCaching: options?.enableCaching ?? Internals.getWebpackCaching(),
			publicPath: options?.publicPath ?? '/',
			maxTimelineTracks: 15,
		}),
	]);
	if (!output) {
		throw new Error('Expected webpack output');
	}

	const {errors} = output.toJson();
	if (errors !== undefined && errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}

	const indexHtmlDir = path.join(__dirname, '..', 'web', 'index.html');
	const content = await fs.promises.readFile(indexHtmlDir, {
		encoding: 'utf-8',
	});
	const withPublicPath = content.replace(
		/%PUBLIC_PATH%/g,
		options?.publicPath ?? '/'
	);
	const outPath = path.join(outDir, 'index.html');
	await fs.promises.writeFile(outPath, withPublicPath);

	return outDir;
};
