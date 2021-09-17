import path from 'path';
import {WebpackOverrideFn} from 'remotion';

type Bundler = 'webpack' | 'esbuild';

const WEBPACK_OR_ESBUILD = 'esbuild' as Bundler;

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
	const replaced = (() => {
		if (WEBPACK_OR_ESBUILD === 'webpack') {
			const {replaceLoadersWithBabel} = require(path.join(
				__dirname,
				'..',
				'..',
				'example',
				'node_modules',
				'@remotion/babel-loader'
			));
			return replaceLoadersWithBabel(currentConfiguration);
		}
		return currentConfiguration;
	})();
	return {
		...replaced,
		module: {
			...replaced.module,
			rules: [
				...(replaced.module?.rules ?? []),
				{
					test: /\.mdx?$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'@babel/preset-env',
									[
										'@babel/preset-react',
										{
											runtime: 'automatic',
										},
									],
								],
							},
						},
						'mdx-loader',
					],
				},
			],
		},
	};
};
