import type {MandatoryLegacyBundleOptions} from '@remotion/bundler';
import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {BundlingState, CopyingState} from '@remotion/studio-server';
import type {GitSource} from '@remotion/studio-shared';
import {existsSync} from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {Log} from './log';
import type {SymbolicLinksState} from './progress-bar';
import {
	createOverwriteableCliOutput,
	makeBundlingAndCopyProgress,
} from './progress-bar';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';

export const bundleOnCliOrTakeServeUrl = async ({
	fullPath,
	remotionRoot,
	publicDir,
	onProgress,
	indentOutput,
	logLevel,
	onDirectoryCreated,
	quietProgress,
	quietFlag,
	outDir,
	gitSource,
	bufferStateDelayInMilliseconds,
	maxTimelineTracks,
	publicPath,
}: {
	fullPath: string;
	remotionRoot: string;
	publicDir: string | null;
	onProgress: (params: {
		bundling: BundlingState;
		copying: CopyingState;
	}) => void;
	indentOutput: boolean;
	logLevel: LogLevel;
	onDirectoryCreated: (path: string) => void;
	quietProgress: boolean;
	quietFlag: boolean;
	outDir: string | null;
	gitSource: GitSource | null;
	bufferStateDelayInMilliseconds: number | null;
	maxTimelineTracks: number | null;
	publicPath: string | null;
}): Promise<{
	urlOrBundle: string;
	cleanup: () => void;
}> => {
	const isServeUrl = RenderInternals.isServeUrl(fullPath);
	const isBundle =
		existsSync(fullPath) && existsSync(path.join(fullPath, 'index.html'));
	if (isServeUrl || isBundle) {
		onProgress({
			bundling: {
				doneIn: 0,
				progress: 1,
			},
			copying: {
				bytes: 0,
				doneIn: 0,
			},
		});
		return {
			urlOrBundle: fullPath,
			cleanup: () => Promise.resolve(undefined),
		};
	}

	const bundled = await bundleOnCli({
		fullPath,
		remotionRoot,
		publicDir,
		onProgressCallback: onProgress,
		indent: indentOutput,
		logLevel,
		onDirectoryCreated,
		quietProgress,
		quietFlag,
		outDir,
		gitSource,
		bufferStateDelayInMilliseconds,
		maxTimelineTracks,
		publicPath,
	});

	return {
		urlOrBundle: bundled,
		cleanup: () => RenderInternals.deleteDirectory(bundled),
	};
};

export const bundleOnCli = async ({
	fullPath,
	remotionRoot,
	publicDir,
	onProgressCallback,
	indent,
	logLevel,
	onDirectoryCreated,
	quietProgress,
	quietFlag,
	outDir,
	gitSource,
	maxTimelineTracks,
	bufferStateDelayInMilliseconds,
	publicPath,
}: {
	fullPath: string;
	remotionRoot: string;
	publicDir: string | null;
	onProgressCallback: (params: {
		bundling: BundlingState;
		copying: CopyingState;
	}) => void;
	indent: boolean;
	logLevel: LogLevel;
	onDirectoryCreated: (path: string) => void;
	quietProgress: boolean;
	quietFlag: boolean;
	outDir: string | null;
	gitSource: GitSource | null;
	maxTimelineTracks: number | null;
	bufferStateDelayInMilliseconds: number | null;
	publicPath: string | null;
}) => {
	const symlinkState: SymbolicLinksState = {
		symlinks: [],
	};

	let copyingState: CopyingState = {
		bytes: 0,
		doneIn: null,
	};

	let copyStart: number | null = null;

	const updateProgress = (newline: boolean) => {
		bundlingProgress.update(
			makeBundlingAndCopyProgress({
				bundling: bundlingState,
				copying: copyingState,
				symLinks: symlinkState,
			}),
			newline,
		);
		onProgressCallback({
			bundling: bundlingState,
			copying: copyingState,
		});
	};

	const onPublicDirCopyProgress = (bytes: number) => {
		if (copyStart === null) {
			copyStart = Date.now();
		}

		copyingState = {
			bytes,
			doneIn: null,
		};
		updateProgress(false);
	};

	const onSymlinkDetected = (absPath: string) => {
		symlinkState.symlinks.push(absPath);
		updateProgress(false);
	};

	const options: MandatoryLegacyBundleOptions = {
		webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
		rootDir: remotionRoot,
		publicDir,
		onPublicDirCopyProgress,
		onSymlinkDetected,
		outDir: outDir ?? null,
		publicPath,
	};

	const bundleStartTime = Date.now();
	const bundlingProgress = createOverwriteableCliOutput({
		quiet: quietProgress || quietFlag,
		cancelSignal: null,
		updatesDontOverwrite: shouldUseNonOverlayingLogger({logLevel}),
		indent,
	});

	let bundlingState: BundlingState = {
		progress: 0,
		doneIn: null,
	};

	const bundled = await BundlerInternals.internalBundle({
		entryPoint: fullPath,
		onProgress: (progress) => {
			bundlingState = {
				progress: progress / 100,
				doneIn: null,
			};
			updateProgress(false);
		},
		onDirectoryCreated,
		gitSource,
		...options,
		ignoreRegisterRootWarning: false,
		maxTimelineTracks,
		bufferStateDelayInMilliseconds,
	});

	bundlingState = {
		progress: 1,
		doneIn: Date.now() - bundleStartTime,
	};
	Log.verbose({logLevel, indent}, `Bundling done in ${bundlingState.doneIn}ms`);
	copyingState = {
		...copyingState,
		doneIn: copyStart ? Date.now() - copyStart : 0,
	};
	Log.verbose({logLevel, indent}, `Copying done in ${copyingState.doneIn}ms`);
	updateProgress(true);

	Log.verbose({indent, logLevel}, 'Bundled under', bundled);

	return bundled;
};
