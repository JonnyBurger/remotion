import type {WebpackConfiguration} from '@remotion/bundler';
import type {RuleSetUseItem} from '@rspack/core';

const envPreset = [
	require.resolve('@babel/preset-env'),
	{
		targets: {
			chrome: '85',
		},
	},
] as const;

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export const replaceLoadersWithBabel = (
	conf: WebpackConfiguration,
): WebpackConfiguration => {
	return {
		...conf,
		module: {
			...conf.module,
			rules: (conf.module?.rules ?? []).map((rule) => {
				if (rule === '...') {
					return rule;
				}

				// All modules that use require.resolve need to be added to cli/src/load-config -> external array
				if (rule && rule.test?.toString().includes('.tsx')) {
					return {
						test: /\.tsx?$/,
						use: [
							{
								loader: require.resolve('babel-loader'),
								options: {
									presets: [
										envPreset,
										[
											require.resolve('@babel/preset-react'),
											{
												runtime: 'automatic',
											},
										],
										[
											require.resolve('@babel/preset-typescript'),
											{
												isTSX: true,
												allExtensions: true,
											},
										],
									],
									plugins: [
										require.resolve('@babel/plugin-proposal-class-properties'),
										conf.mode === 'development'
											? require.resolve('react-refresh/babel')
											: null,
									].filter(truthy),
								},
							},
							(rule.use as RuleSetUseItem[])[1],
						].filter(truthy),
					};
				}

				if (rule && rule.test?.toString().includes('.jsx')) {
					return {
						test: /\.jsx?$/,
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								envPreset,
								[
									require.resolve('@babel/preset-react'),
									{
										runtime: 'automatic',
									},
								],
							],
							plugins: [
								require.resolve('@babel/plugin-proposal-class-properties'),
							],
						},
					};
				}

				return rule;
			}),
		},
	};
};
