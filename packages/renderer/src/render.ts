import path from 'path';
import {Browser as PuppeteerBrowser} from 'puppeteer-core';
import {
	Browser,
	FrameRange,
	ImageFormat,
	Internals,
	RenderAssetInfo,
	VideoConfig,
} from 'remotion';
import {getActualConcurrency} from './get-concurrency';
import {getFrameCount} from './get-frame-range';
import {getFrameToRender} from './get-frame-to-render';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {openBrowser} from './open-browser';
import {Pool} from './pool';
import {provideScreenshot} from './provide-screenshot';
import {seekToFrame} from './seek-to-frame';
import {serveStatic} from './serve-static';

export type RenderFramesOutput = {
	frameCount: number;
	assetsInfo: RenderAssetInfo;
};

export type OnStartData = {
	frameCount: number;
};

export const renderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
	compositionId,
	outputDir,
	onStart,
	inputProps,
	webpackBundle,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
	browser = Internals.DEFAULT_BROWSER,
	frameRange,
	dumpBrowserLogs = false,
	puppeteerInstance,
}: {
	config: VideoConfig;
	compositionId: string;
	onStart: (data: OnStartData) => void;
	onFrameUpdate: (f: number) => void;
	outputDir: string;
	inputProps: unknown;
	webpackBundle: string;
	imageFormat: ImageFormat;
	parallelism?: number | null;
	quality?: number;
	browser?: Browser;
	frameRange?: FrameRange | null;
	dumpBrowserLogs?: boolean;
	puppeteerInstance?: PuppeteerBrowser;
}): Promise<RenderFramesOutput> => {
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}

	const actualParallelism = getActualConcurrency(parallelism ?? null);

	const [{port, close}, browserInstance] = await Promise.all([
		serveStatic(webpackBundle),
		puppeteerInstance ??
			openBrowser(browser, {
				shouldDumpIo: dumpBrowserLogs,
			}),
	]);
	const pages = new Array(actualParallelism).fill(true).map(async () => {
		const page = await browserInstance.newPage();
		page.setViewport({
			width: config.width,
			height: config.height,
			deviceScaleFactor: 1,
		});
		page.on('error', console.error);
		page.on('pageerror', console.error);

		if (inputProps) {
			await page.goto(`http://localhost:${port}/index.html`);

			await page.evaluate(
				(key, input) => {
					window.localStorage.setItem(key, input);
				},
				Internals.INPUT_PROPS_KEY,
				JSON.stringify(inputProps)
			);
		}

		const site = `http://localhost:${port}/index.html?composition=${compositionId}`;
		await page.goto(site);
		return page;
	});

	const puppeteerPages = await Promise.all(pages);
	const pool = new Pool(puppeteerPages);

	const frameCount = getFrameCount(config.durationInFrames, frameRange ?? null);
	// Substract one because 100 frames will be 00-99
	// --> 2 digits
	let filePadLength = 0;
	if (frameCount) {
		filePadLength = String(frameCount - 1).length;
	}

	let framesRendered = 0;

	onStart({
		frameCount,
	});
	const assets = await Promise.all(
		new Array(frameCount)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (index) => {
				const frame = getFrameToRender(frameRange ?? null, index);
				const freePage = await pool.acquire();
				const paddedIndex = String(frame).padStart(filePadLength, '0');

				await seekToFrame({frame, page: freePage});
				if (imageFormat !== 'none') {
					await provideScreenshot({
						page: freePage,
						imageFormat,
						quality,
						options: {
							frame,
							output: path.join(
								outputDir,
								`element-${paddedIndex}.${imageFormat}`
							),
						},
					});
				}

				const collectedAssets = await freePage.evaluate(() => {
					return window.remotion_collectAssets();
				});
				pool.release(freePage);
				framesRendered++;
				onFrameUpdate(framesRendered);
				return collectedAssets;
			})
	);
	close().catch((err) => {
		console.log('Unable to close web server', err);
	});
	// If browser instance was passed in, we close all the pages
	// we opened.
	// If new browser was opened, then closing the browser as a cleanup.

	if (puppeteerInstance) {
		await Promise.all(puppeteerPages.map((p) => p.close())).catch((err) => {
			console.log('Unable to close browser tab', err);
		});
	} else {
		browserInstance.close().catch((err) => {
			console.log('Unable to close browser', err);
		});
	}

	return {
		assetsInfo: {
			assets,
			bundleDir: webpackBundle,
		},
		frameCount,
	};
};
