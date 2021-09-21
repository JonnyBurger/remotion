import {bundle, BundlerInternals} from '@remotion/bundler';
import {Internals} from 'remotion';
import {Log} from './log';
import {
	createOverwriteableCliOutput,
	makeBundlingProgress,
} from './progress-bar';

export const bundleOnCli = async (fullPath: string, steps: number) => {
	const shouldCache = Internals.getWebpackCaching();
	const cacheExistedBefore = BundlerInternals.cacheExists('production', null);
	if (cacheExistedBefore && !shouldCache) {
		Log.info('🧹 Cache disabled but found. Deleting... ');
		await BundlerInternals.clearCache('production', null);
	}

	const bundleStartTime = Date.now();
	const bundlingProgress = createOverwriteableCliOutput();
	const bundled = await bundle(
		fullPath,
		(progress) => {
			bundlingProgress.update(
				makeBundlingProgress({progress: progress / 100, steps, doneIn: null})
			);
		},
		{
			enableCaching: shouldCache,
		}
	);
	bundlingProgress.update(
		makeBundlingProgress({
			progress: 1,
			steps,
			doneIn: Date.now() - bundleStartTime,
		}) + '\n'
	);
	Log.verbose('Bundled under', bundled);
	const cacheExistedAfter = BundlerInternals.cacheExists('production', null);
	if (cacheExistedAfter && !cacheExistedBefore) {
		Log.info('⚡️ Cached bundle. Subsequent builds will be faster.');
	}

	return bundled;
};
