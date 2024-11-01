import type {Configuration} from '@rspack/core';
import webpack, {ProgressPlugin} from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import ReactDOM from 'react-dom';
import {NoReactInternals} from 'remotion/no-react';
import {CaseSensitivePathsPlugin} from './case-sensitive-paths';
import {
	OPTIONAL_DEPENDENCIES,
	SOURCE_MAP_IGNORE,
} from './optional-dependencies';
export type WebpackConfiguration = Configuration;

export type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration,
) => WebpackConfiguration | Promise<WebpackConfiguration>;

if (!ReactDOM?.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`,
	);
}

const shouldUseReactDomClient = NoReactInternals.ENABLE_V5_BREAKING_CHANGES
	? true
	: parseInt(reactDomVersion, 10) >= 18;

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

const options = (environment: 'development' | 'production') => ({
	jsc: {
		parser: {
			syntax: 'typescript',
			tsx: true,
		},
		transform: {
			react: {
				runtime: 'automatic',
				development: environment === 'development',
				refresh: environment === 'development',
			},
		},
		externalHelpers: true,
	},
	env: {
		targets: 'Chrome >= 85', // browser compatibility
	},
});

export const webpackConfig = async ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	webpackOverride = (f) => f,
	onProgress,
	maxTimelineTracks,
	remotionRoot,
	keyboardShortcutsEnabled,
	bufferStateDelayInMilliseconds,
	poll,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string | null;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgress?: (f: number) => void;
	maxTimelineTracks: number | null;
	keyboardShortcutsEnabled: boolean;
	bufferStateDelayInMilliseconds: number | null;
	remotionRoot: string;
	poll: number | null;
}): Promise<WebpackConfiguration> => {
	let lastProgress = 0;

	const isBun = typeof Bun !== 'undefined';

	const define = new webpack.DefinePlugin({
		'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
		'process.env.KEYBOARD_SHORTCUTS_ENABLED': keyboardShortcutsEnabled,
		'process.env.BUFFER_STATE_DELAY_IN_MILLISECONDS':
			bufferStateDelayInMilliseconds,
	});

	const conf: WebpackConfiguration = await webpackOverride({
		optimization: {
			minimize: false,
		},
		experiments: {
			lazyCompilation: isBun
				? false
				: environment === 'production'
					? false
					: {
							entries: false,
						},
		},
		watchOptions: {
			poll: poll ?? undefined,
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/.turbo/**', '**/node_modules/**'],
		},
		// Higher source map quality in development to power line numbers for stack traces
		devtool:
			environment === 'development' ? 'source-map' : 'cheap-module-source-map',
		entry: [
			require.resolve('./setup-environment'),
			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactRefreshPlugin(),
						new CaseSensitivePathsPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						define,
					]
				: [
						new ProgressPlugin((p) => {
							if (onProgress) {
								if ((p === 1 && p > lastProgress) || p - lastProgress > 0.05) {
									lastProgress = p;
									onProgress(Number((p * 100).toFixed(2)));
								}
							}
						}),
						define,
					],
		output: {
			hashFunction: 'xxhash64',
			filename: NoReactInternals.bundleName,
			devtoolModuleFilenameTemplate: '[resource-path]',
			assetModuleFilename:
				environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.web.js', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
				react: require.resolve('react'),
				'react-dom/client': shouldUseReactDomClient
					? require.resolve('react-dom/client')
					: require.resolve('react-dom'),
				// Note: Order matters here! "remotion/no-react" must be matched before "remotion"
				'remotion/no-react': require.resolve('remotion/no-react'),
				remotion: require.resolve('remotion'),
			},
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [require.resolve('style-loader'), require.resolve('css-loader')],
					type: 'javascript/auto',
				},
				{
					test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mov|mp3|m4a|wav|aac)$/,
					type: 'asset/resource',
				},
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: 'builtin:swc-loader',
							options: options(environment),
						},
					].filter(truthy),
				},
				{
					test: /\.(woff(2)?|otf|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
					type: 'asset/resource',
				},
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'builtin:swc-loader',
							options: options(environment),
						},
					].filter(truthy),
				},
			],
		},
		ignoreWarnings: [
			...OPTIONAL_DEPENDENCIES.map(
				(dep) => new RegExp(`Can't resolve '${dep}'`),
			),
			...SOURCE_MAP_IGNORE.map((dep) => {
				return (warning: Error) =>
					warning.message.includes(`Can't resolve '${dep}'`) &&
					warning.message.includes('source-map');
			}),
			// If importing TypeScript, it will give this warning:
			// WARNING in ./node_modules/typescript/lib/typescript.js 6304:33-52
			// Critical dependency: the request of a dependency is an expression
			/the request of a dependency is an expression/,
		],
	});
	return {
		...conf,
		output: {
			...conf.output,
			...(outDir ? {path: outDir} : {}),
		},
		context: remotionRoot,
	};
};
