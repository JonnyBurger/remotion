import {RenderInternals} from '@remotion/renderer';
import {stat} from 'fs/promises';
import path from 'path';
import {exit} from 'process';
import {Log} from './log';
import {bundleOnCli} from './setup-cache';
import {RenderStep} from './step';

export const prepareEntryPoint = async ({
	file,
	otherSteps,
	publicPath,
	outDir,
}: {
	file: string;
	otherSteps: RenderStep[];
	outDir: string | null;
	publicPath: string | null;
}): Promise<{
	urlOrBundle: string;
	steps: RenderStep[];
	shouldDelete: boolean;
}> => {
	if (RenderInternals.isServeUrl(file)) {
		return {urlOrBundle: file, steps: otherSteps, shouldDelete: false};
	}

	const joined = path.resolve(process.cwd(), file);

	try {
		const stats = await stat(joined);
		if (stats.isDirectory()) {
			return {urlOrBundle: joined, steps: otherSteps, shouldDelete: false};
		}
	} catch (err) {
		Log.error(`No file or directory exists at ${joined}.`);
		exit(1);
	}

	const urlOrBundle = await bundleOnCli({
		fullPath: joined,
		steps: ['bundling', ...otherSteps],
		outDir,
		publicPath,
	});

	return {urlOrBundle, steps: ['bundling', ...otherSteps], shouldDelete: true};
};
