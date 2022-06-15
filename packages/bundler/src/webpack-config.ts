import ReactDOM from 'react-dom';
import {Internals, WebpackConfiguration, WebpackOverrideFn} from 'remotion';
import webpack, {ProgressPlugin} from 'webpack';
import {LoaderOptions} from './esbuild-loader/interfaces';
import {ReactFreshWebpackPlugin} from './fast-refresh';
import {getWebpackCacheName} from './webpack-cache';
import esbuild = require('esbuild');

if (!ReactDOM || !ReactDOM.version) {
	throw new Error('Could not find "react-dom" package. Did you install it?');
}

const reactDomVersion = ReactDOM.version.split('.')[0];
if (reactDomVersion === '0') {
	throw new Error(
		`Version ${reactDomVersion} of "react-dom" is not supported by Remotion`
	);
}

const shouldUseReactDomClient = parseInt(reactDomVersion, 10) >= 18;

const esbuildLoaderOptions: LoaderOptions = {
	target: 'chrome85',
	loader: 'tsx',
	implementation: esbuild,
};

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const webpackConfig = ({
	entry,
	userDefinedComponent,
	outDir,
	environment,
	webpackOverride = (f) => f,
	onProgressUpdate,
	enableCaching = Internals.DEFAULT_WEBPACK_CACHE_ENABLED,
	inputProps,
	envVariables,
	maxTimelineTracks,
	entryPoints,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
	webpackOverride: WebpackOverrideFn;
	onProgressUpdate?: (f: number) => void;
	enableCaching?: boolean;
	inputProps: object;
	envVariables: Record<string, string>;
	maxTimelineTracks: number;
	entryPoints: string[];
}): WebpackConfiguration => {
	return webpackOverride({
		optimization: {
			minimize: false,
		},
		experiments: {
			lazyCompilation:
				environment === 'production'
					? false
					: {
							entries: false,
					  },
		},
		watchOptions: {
			aggregateTimeout: 0,
			ignored: ['**/.git/**', '**/node_modules/**'],
		},
		cache: enableCaching
			? {
					type: 'filesystem',
					name: getWebpackCacheName(environment, inputProps ?? {}),
			  }
			: false,
		devtool:
			environment === 'development'
				? 'cheap-module-source-map'
				: 'cheap-module-source-map',
		entry: [
			require.resolve('./setup-environment'),
			...entryPoints,
			environment === 'development'
				? require.resolve('./fast-refresh/runtime.js')
				: null,

			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ReactFreshWebpackPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						new webpack.DefinePlugin({
							'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
							'process.env.INPUT_PROPS': JSON.stringify(inputProps ?? {}),
							[`process.env.${Internals.ENV_VARIABLES_ENV_NAME}`]:
								JSON.stringify(envVariables),
						}),
				  ]
				: [
						new ProgressPlugin((p) => {
							if (onProgressUpdate) {
								onProgressUpdate(Number((p * 100).toFixed(2)));
							}
						}),
				  ],
		output: {
			hashFunction: 'xxhash64',
			globalObject: 'this',
			filename: 'bundle.js',
			path: outDir,
			devtoolModuleFilenameTemplate: '[resource-path]',
			assetModuleFilename:
				environment === 'development' ? '[path][name][ext]' : '[hash][ext]',
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				react: require.resolve('react'),
				'react-dom/client': shouldUseReactDomClient
					? require.resolve('react-dom/client')
					: require.resolve('react-dom'),
				remotion: require.resolve('remotion'),
				'react-native$': 'react-native-web',
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
							loader: require.resolve('./esbuild-loader/index.js'),
							options: esbuildLoaderOptions,
						},
						// Keep the order to match babel-loader
						environment === 'development'
							? {
									loader: require.resolve('./fast-refresh/loader.js'),
							  }
							: null,
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
							loader: require.resolve('./esbuild-loader/index.js'),
							options: esbuildLoaderOptions,
						},
						environment === 'development'
							? {
									loader: require.resolve('./fast-refresh/loader.js'),
							  }
							: null,
					].filter(truthy),
				},
			],
		},
	});
};
