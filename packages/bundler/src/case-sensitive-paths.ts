import type {Compiler} from '@rspack/core';
import path from 'path';

// Inlined from https://github.com/umijs/case-sensitive-paths-webpack-plugin/blob/master/src/index.ts

/**
 * The MIT License (MIT)

Copyright (c) 2022-present UmiJS Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

const PLUGIN_NAME = 'CaseSensitive';

export class CaseSensitivePathsPlugin {
	fs!: Compiler['inputFileSystem'];
	context: string = '';
	cacheMap = new Map<string, string[]>();
	deferrerMap = new Map<string, Promise<string[]>>();

	/**
	 * Check if resource need to be checked
	 */
	isCheckable(res: string, type?: string, issuer?: string) {
		return (
			// skip base64 url in css files
			type !== 'asset/inline' &&
			// skip resources which outside project
			res.startsWith(this.context) &&
			// skip node_modules
			!/(\/|\\)node_modules\1/.test(res) &&
			// skip duplicated css resource by unknown reason
			res !== issuer
		);
	}

	/**
	 * Check if file exists with case sensitive
	 */
	checkFileExistsWithCase(res: string) {
		return new Promise((resolve, reject) => {
			let full = res;
			let caseError: Error | null = null;
			const deferrers: Promise<string[]>[] = [];

			// check every level directories for resource, except outside project
			while (full.length > this.context.length) {
				const {dir, base: current} = path.parse(full);
				let deferrer: (typeof deferrers)['0'];

				if (this.cacheMap.get(dir)) {
					// use cache first
					deferrer = Promise.resolve(this.cacheMap.get(dir)!);
				} else if (this.deferrerMap.get(dir)) {
					// wait another same directory to be resolved
					deferrer = this.deferrerMap.get(dir)!;
				} else {
					// read directory for the first time
					deferrer = new Promise((resolve2) => {
						this.fs!.readdir(dir, (_, files = []) => {
							// save cache, resolve promise and release deferrer
							this.cacheMap.set(dir, files as string[]);
							resolve2(files as string[]);
							this.deferrerMap.delete(dir);
						});
					});
					// save deferrer for another called
					this.deferrerMap.set(dir, deferrer);
				}

				// check current file synchronously, for performance
				deferrer.then((files) => {
					// try to find correct name
					// if current file not exists in current directory and there has no existing error
					if (!files.includes(current) && !caseError) {
						const correctName = files.find(
							(file) => file.toLowerCase() === current.toLowerCase(),
						);

						// only throw first error for the single resource
						if (correctName) {
							caseError = new Error(
								`Capitalization mismatch in \`${path.join(
									res,
								)}\`: \`${current}\` does not match the name on disk \`${correctName}\``,
							);
							reject(caseError);
						}
					}
				});
				deferrers.push(deferrer);

				// continue to check upper directory
				full = dir;
			}

			Promise.all(deferrers).then(() => {
				// resolve if no error
				if (!caseError) {
					resolve(caseError);
				}
			});
		});
	}

	/**
	 * reset this plugin, wait for the next compilation
	 */
	reset() {
		this.cacheMap = new Map();
		this.deferrerMap = new Map();
	}

	apply(compiler: Compiler) {
		this.context = compiler.options.context || process.cwd();
		this.fs = compiler.inputFileSystem;

		compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
			factory.hooks.afterResolve.tapAsync(PLUGIN_NAME, (data, done) => {
				// compatible with webpack 4.x
				const {createData = data as typeof data.createData} = data;

				if (
					createData &&
					createData.resource &&
					this.isCheckable(
						createData.resource,
						// @ts-expect-error
						createData.type,
						// @ts-expect-error
						createData.resourceResolveData?.context?.issuer,
					)
				) {
					this.checkFileExistsWithCase(
						createData.resource
							.replace(/\?.+$/, '')
							// replace escaped \0# with # see: https://github.com/webpack/enhanced-resolve#escaping
							.replace('\u0000#', '#'),
					).then(
						() => done(null),
						(err) => done(err),
					);
				} else {
					done(null);
				}
			});
		});

		compiler.hooks.done.tap(PLUGIN_NAME, () => {
			this.reset();
		});
	}
}
