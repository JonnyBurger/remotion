import fs, {mkdirSync, statSync} from 'fs';
import path from 'path';
import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Browser,
	BrowserExecutable,
	Internals,
	StillImageFormat,
	TCompMetadata,
} from 'remotion';
import {openBrowser} from './open-browser';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {setPropsAndEnv} from './set-props-and-env';

/**
 * @description Render a still frame from a composition and returns an image path
 */
export const renderStill = async ({
	composition,
	quality,
	imageFormat = 'png',
	serveUrl,
	browser = Internals.DEFAULT_BROWSER,
	puppeteerInstance,
	dumpBrowserLogs = false,
	onError,
	inputProps,
	envVariables,
	output,
	frame = 0,
	overwrite = true,
	browserExecutable,
}: {
	composition: TCompMetadata;
	output: string;
	serveUrl: string;
	frame?: number;
	inputProps?: unknown;
	imageFormat?: StillImageFormat;
	quality?: number;
	browser?: Browser;
	puppeteerInstance?: PuppeteerBrowser;
	dumpBrowserLogs?: boolean;
	onError?: (err: Error) => void;
	envVariables?: Record<string, string>;
	overwrite?: boolean;
	browserExecutable?: BrowserExecutable;
}) => {
	Internals.validateDimension(
		composition.height,
		'height',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateDimension(
		composition.width,
		'width',
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateFps(
		composition.fps,
		'in the `config` object of `renderStill()`'
	);
	Internals.validateDurationInFrames(
		composition.durationInFrames,
		'in the `config` object passed to `renderStill()`'
	);
	Internals.validateNonNullImageFormat(imageFormat);
	Internals.validateFrame(frame, composition.durationInFrames);

	if (typeof output !== 'string') {
		throw new TypeError('`output` parameter was not passed or is not a string');
	}

	output = path.resolve(process.cwd(), output);

	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	Internals.validateQuality(quality);

	if (fs.existsSync(output)) {
		if (!overwrite) {
			throw new Error(
				`Cannot render still - "overwrite" option was set to false, but the output destination ${output} already exists.`
			);
		}

		const stat = statSync(output);

		if (!stat.isFile()) {
			throw new Error(
				`The output location ${output} already exists, but is not a file, but something else (e.g. folder). Cannot save to it.`
			);
		}
	}

	mkdirSync(path.resolve(output, '..'), {
		recursive: true,
	});

	const browserInstance =
		puppeteerInstance ??
		(await openBrowser(browser, {
			browserExecutable,
			shouldDumpIo: dumpBrowserLogs,
		}));
	const page = await browserInstance.newPage();
	page.setViewport({
		width: composition.width,
		height: composition.height,
		deviceScaleFactor: 1,
	});
	const errorCallback = (err: Error) => {
		onError?.(err);
	};

	page.on('pageerror', errorCallback);
	const site = `${serveUrl}/index.html?composition=${composition.id}`;
	await setPropsAndEnv({
		inputProps,
		envVariables,
		page,
		serveUrl,
		initialFrame: frame,
	});

	await page.goto(site);
	try {
		await seekToFrame({frame, page});
	} catch (err) {
		const error = err as Error;
		if (
			error.message.includes('timeout') &&
			error.message.includes('exceeded')
		) {
			errorCallback(
				new Error(
					'The rendering timed out. See https://www.remotion.dev/docs/timeout/ for possible reasons.'
				)
			);
		} else {
			errorCallback(error);
		}

		throw error;
	}

	await provideScreenshot({
		page,
		imageFormat,
		quality,
		options: {
			frame,
			output,
		},
	});

	page.off('pageerror', errorCallback);

	if (puppeteerInstance) {
		await page.close();
	} else {
		browserInstance.close().catch((err) => {
			console.log('Unable to close browser', err);
		});
	}
};
