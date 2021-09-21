import path from 'path';
import {Internals, WebpackConfiguration, WebpackOverrideFn} from 'remotion';
import webpack, {ProgressPlugin} from 'webpack';
import {getWebpackCacheName} from './webpack-cache';

const ErrorOverlayPlugin = require('@webhotelier/webpack-fast-refresh/error-overlay');
const ReactRefreshPlugin = require('@webhotelier/webpack-fast-refresh');

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
	publicPath,
	maxTimelineTracks,
}: {
	entry: string;
	userDefinedComponent: string;
	outDir: string;
	environment: 'development' | 'production';
	webpackOverride?: WebpackOverrideFn;
	onProgressUpdate?: (f: number) => void;
	enableCaching?: boolean;
	inputProps?: object;
	envVariables?: Record<string, string>;
	publicPath?: string;
	maxTimelineTracks: number;
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
		cache: enableCaching
			? {
					type: 'filesystem',
					name: getWebpackCacheName(environment, inputProps ?? {}),
			  }
			: false,
		devtool: 'cheap-module-source-map',
		entry: [
			require.resolve('./setup-environment'),
			environment === 'development'
				? require.resolve('webpack-hot-middleware/client') + '?overlay=true'
				: null,
			environment === 'development'
				? require.resolve('@webhotelier/webpack-fast-refresh/runtime.js')
				: null,
			userDefinedComponent,
			require.resolve('../react-shim.js'),
			entry,
		].filter(Boolean) as [string, ...string[]],
		mode: environment,
		plugins:
			environment === 'development'
				? [
						new ErrorOverlayPlugin(),
						new ReactRefreshPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						new webpack.DefinePlugin({
							'process.env.MAX_TIMELINE_TRACKS': maxTimelineTracks,
							'process.env.INPUT_PROPS': JSON.stringify(inputProps ?? {}),
							[`process.env.${Internals.ENV_VARIABLES_ENV_NAME}`]: JSON.stringify(
								envVariables ?? {}
							),
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
			globalObject: 'this',
			filename: 'bundle.js',
			path: outDir,
			publicPath: publicPath ?? '/',
		},
		devServer: {
			contentBase: path.resolve(__dirname, '..', 'web'),
			historyApiFallback: true,
			hot: true,
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				// Only one version of react
				'react/jsx-runtime': require.resolve('react/jsx-runtime'),
				react: require.resolve('react'),
				remotion: require.resolve('remotion'),
				'styled-components': require.resolve('styled-components'),
				'react-native$': 'react-native-web',
			},
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [require.resolve('style-loader'), require.resolve('css-loader')],
				},
				{
					test: /\.(png|svg|jpg|jpeg|webp|gif|bmp|webm|mp4|mp3|m4a|wav|aac)$/,
					use: [
						{
							loader: require.resolve('file-loader'),
							options: {
								// So you can do require('hi.png')
								// instead of require('hi.png').default
								esModule: false,
								name: () => {
									// Don't rename files in development
									// so we can show the filename in the timeline
									if (environment === 'development') {
										return '[path][name].[ext]';
									}

									return '[contenthash].[ext]';
								},
							},
						},
					],
				},
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: require.resolve('esbuild-loader'),
							options: {
								loader: 'tsx',
								target: 'chrome85',
							},
						},
						environment === 'development'
							? {
									loader: require.resolve(
										'@webhotelier/webpack-fast-refresh/loader.js'
									),
							  }
							: null,
					].filter(truthy),
				},
				{
					test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: require.resolve('file-loader'),
							options: {
								name: '[name].[ext]',
								outputPath: 'fonts/',
							},
						},
					],
				},
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: require.resolve('esbuild-loader'),
							options: {
								loader: 'jsx',
								target: 'chrome85',
							},
						},
						environment === 'development'
							? {
									loader: require.resolve(
										'@webhotelier/webpack-fast-refresh/loader.js'
									),
							  }
							: null,
					].filter(truthy),
				},
			],
		},
	});
};
