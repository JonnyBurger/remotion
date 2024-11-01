import type {WebpackOverrideFn} from '@remotion/bundler';
import {webpack} from '@remotion/bundler';
import fs from 'fs';

/**
 * @description A function that modifies the default Webpack configuration to make the necessary changes to support Skia.
 * @see [Documentation](https://www.remotion.dev/docs/skia/enable-skia)
 */
export const enableSkia: WebpackOverrideFn = (currentConfiguration) => {
	return {
		...currentConfiguration,
		plugins: [
			...(currentConfiguration.plugins ?? []),
			new (class CopySkiaPlugin {
				apply(compiler: webpack.Compiler) {
					compiler.hooks.thisCompilation.tap('AddSkiaPlugin', (compilation) => {
						compilation.hooks.processAssets.tapPromise(
							{
								name: 'copy-skia',
								stage:
									compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
							},
							async () => {
								const src = require.resolve(
									'canvaskit-wasm/bin/full/canvaskit.wasm',
								);
								if (compilation.getAsset(src)) {
									// Skip emitting the asset again because it's immutable
									return;
								}

								compilation.emitAsset(
									'canvaskit.wasm',
									new webpack.sources.RawSource(
										await fs.promises.readFile(src),
									),
								);
							},
						);
					});
				}
			})(),
		],
		resolve: {
			...currentConfiguration.resolve,
			// FIXME: To fix missing modules in browser when using webassembly
			fallback: {
				fs: false,
				path: false,
			},
			extensions: [
				'.web.js',
				'.web.ts',
				'.web.tsx',
				'.js',
				'.ts',
				'.tsx',
				'...',
			],
			alias: {
				...currentConfiguration.resolve?.alias,
				'react-native-reanimated': "require('react-native-reanimated')",
				'react-native-reanimated/lib/reanimated2/core':
					"require('react-native-reanimated/lib/reanimated2/core')",
				'react-native/Libraries/Image/AssetRegistry': false,
			},
		},
	};
};
