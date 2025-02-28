/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import extractZip from 'extract-zip';

import {promisify} from 'node:util';

import {downloadFile} from '../assets/download-file';
import {makeFileExecutableIfItIsNot} from '../compositor/make-file-executable';
import type {LogLevel} from '../log-level';
import {ChromeMode} from '../options/chrome-mode';
import type {DownloadBrowserProgressFn} from '../options/on-browser-download';
import {getDownloadsCacheDir} from './get-download-destination';

const TESTED_VERSION = '133.0.6943.0';
// https://github.com/microsoft/playwright/tree/v1.42.0
const PLAYWRIGHT_VERSION = '1105'; // 123.0.6312.4

type Platform = 'linux64' | 'linux-arm64' | 'mac-x64' | 'mac-arm64' | 'win64';

function getChromeDownloadUrl({
	platform,
	version,
	chromeMode,
}: {
	platform: Platform;
	version: string | null;
	chromeMode: ChromeMode;
}): string {
	if (platform === 'linux-arm64') {
		if (chromeMode === 'chrome-for-testing') {
			throw new Error(
				`chromeMode: 'chrome-for-testing' is not supported on platform linux-arm64`,
			);
		}
		return `https://playwright.azureedge.net/builds/chromium/${version ?? PLAYWRIGHT_VERSION}/chromium-linux-arm64.zip`;
	}

	if (chromeMode === 'headless-shell') {
		return `https://storage.googleapis.com/chrome-for-testing-public/${
			version ?? TESTED_VERSION
		}/${platform}/chrome-headless-shell-${platform}.zip`;
	}

	return `https://storage.googleapis.com/chrome-for-testing-public/${
		version ?? TESTED_VERSION
	}/${platform}/chrome-${platform}.zip`;
}

const mkdirAsync = fs.promises.mkdir;
const unlinkAsync = promisify(fs.unlink.bind(fs));

function existsAsync(filePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(filePath, (err) => {
			return resolve(!err);
		});
	});
}

interface BrowserFetcherRevisionInfo {
	folderPath: string;
	executablePath: string;
	url: string;
	local: boolean;
}

const getPlatform = (): Platform => {
	const platform = os.platform();
	switch (platform) {
		case 'darwin':
			return os.arch() === 'arm64' ? 'mac-arm64' : 'mac-x64';
		case 'linux':
			return os.arch() === 'arm64' ? 'linux-arm64' : 'linux64';
		case 'win32':
			return 'win64';
		default:
			throw new Error('Unsupported platform: ' + platform);
	}
};

const getDownloadsFolder = (chromeMode: ChromeMode) => {
	const destination =
		chromeMode === 'headless-shell'
			? 'chrome-headless-shell'
			: 'chrome-for-testing';

	return path.join(getDownloadsCacheDir(), destination);
};

export const downloadBrowser = async ({
	logLevel,
	indent,
	onProgress,
	version,
	chromeMode,
}: {
	logLevel: LogLevel;
	indent: boolean;
	onProgress: DownloadBrowserProgressFn;
	version: string | null;
	chromeMode: ChromeMode;
}): Promise<BrowserFetcherRevisionInfo | undefined> => {
	const platform = getPlatform();
	const downloadURL = getChromeDownloadUrl({platform, version, chromeMode});
	const fileName = downloadURL.split('/').pop();
	if (!fileName) {
		throw new Error(`A malformed download URL was found: ${downloadURL}.`);
	}

	const downloadsFolder = getDownloadsFolder(chromeMode);
	const archivePath = path.join(downloadsFolder, fileName);
	const outputPath = getFolderPath(downloadsFolder, platform);

	if (await existsAsync(outputPath)) {
		return getRevisionInfo(chromeMode);
	}

	if (!(await existsAsync(downloadsFolder))) {
		await mkdirAsync(downloadsFolder, {
			recursive: true,
		});
	}

	if (
		os.platform() !== 'darwin' &&
		os.platform() !== 'linux' &&
		os.arch() === 'arm64'
	) {
		throw new Error(
			[
				'Chrome Headless Shell is not available for Windows for arm64 architecture.',
			].join('\n'),
		);
	}

	try {
		await downloadFile({
			url: downloadURL,
			to: () => archivePath,
			onProgress: (progress) => {
				if (progress.totalSize === null || progress.percent === null) {
					throw new Error('Expected totalSize and percent to be defined');
				}

				onProgress({
					downloadedBytes: progress.downloaded,
					totalSizeInBytes: progress.totalSize,
					percent: progress.percent,
				});
			},
			indent,
			logLevel,
		});
		await extractZip(archivePath, {dir: outputPath});
		const chromePath = path.join(outputPath, 'chrome-linux', 'chrome');
		const chromeHeadlessShellPath = path.join(
			outputPath,
			'chrome-linux',
			'chrome-headless-shell',
		);
		if (fs.existsSync(chromePath)) {
			fs.renameSync(chromePath, chromeHeadlessShellPath);
		}

		const chromeLinuxFolder = path.join(outputPath, 'chrome-linux');
		if (fs.existsSync(chromeLinuxFolder)) {
			fs.renameSync(
				chromeLinuxFolder,
				path.join(outputPath, 'chrome-headless-shell-linux-arm64'),
			);
		}
	} catch (err) {
		return Promise.reject(err);
	} finally {
		if (await existsAsync(archivePath)) {
			await unlinkAsync(archivePath);
		}
	}

	const revisionInfo = getRevisionInfo(chromeMode);
	makeFileExecutableIfItIsNot(revisionInfo.executablePath);

	return revisionInfo;
};

const getFolderPath = (downloadsFolder: string, platform: Platform): string => {
	return path.resolve(downloadsFolder, platform);
};

const getExecutablePath = (chromeMode: ChromeMode) => {
	const downloadsFolder = getDownloadsFolder(chromeMode);
	const platform = getPlatform();
	const folderPath = getFolderPath(downloadsFolder, platform);

	if (chromeMode === 'chrome-for-testing') {
		if (platform === 'mac-arm64' || platform === 'mac-x64') {
			return path.join(
				folderPath,
				`chrome-${platform}`,
				'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
			);
		}
		if (platform === 'win64') {
			return path.join(folderPath, 'chrome-win64', 'chrome.exe');
		}
		if (platform === 'linux64' || platform === 'linux-arm64') {
			return path.join(folderPath, 'chrome-linux64', 'chrome');
		}

		throw new Error('unsupported platform' + (platform satisfies never));
	}
	if (chromeMode === 'headless-shell') {
		return path.join(
			folderPath,
			`chrome-headless-shell-${platform}`,
			platform === 'win64'
				? 'chrome-headless-shell.exe'
				: 'chrome-headless-shell',
		);
	}

	throw new Error('unsupported chrome mode' + (chromeMode satisfies never));
};

export const getRevisionInfo = (
	chromeMode: ChromeMode,
): BrowserFetcherRevisionInfo => {
	const executablePath = getExecutablePath(chromeMode);
	const downloadsFolder = getDownloadsFolder(chromeMode);
	const platform = getPlatform();
	const folderPath = getFolderPath(downloadsFolder, platform);

	const url = getChromeDownloadUrl({platform, version: null, chromeMode});
	const local = fs.existsSync(folderPath);
	return {
		executablePath,
		folderPath,
		local,
		url,
	};
};
