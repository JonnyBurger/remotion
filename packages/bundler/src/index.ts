import {findClosestFolderWithItem, getConfig, internalBundle} from './bundle';
import {indexHtml} from './index-html';
import {readRecursively} from './read-recursively';
import {webpackConfig} from './webpack-config';
import webpack = require('@rspack/core');

export const BundlerInternals = {
	webpackConfig,
	indexHtml,
	getConfig,
	readRecursively,
	findClosestFolderWithItem,
	internalBundle,
};

export type {GitSource} from '@remotion/studio-shared';
export {
	bundle,
	BundleOptions,
	LegacyBundleOptions,
	MandatoryLegacyBundleOptions,
} from './bundle';
export {WebpackConfiguration, WebpackOverrideFn} from './webpack-config';
export {webpack};
