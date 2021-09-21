import fs from 'fs';
import {CDPSession, Page, ScreenshotOptions, Target} from 'puppeteer-core';
import {Internals, StillImageFormat} from 'remotion';

export const _screenshotTask = async (
	page: Page,
	format: StillImageFormat,
	options: ScreenshotOptions
): Promise<Buffer | string> => {
	const client = ((page as unknown) as {_client: CDPSession})._client;
	const target = ((page as unknown) as {_target: Target})._target;

	const perfTarget = Internals.perf.startPerfMeasure('activate-target');

	await client.send('Target.activateTarget', {
		targetId: target._targetId,
	});
	Internals.perf.stopPerfMeasure(perfTarget);

	const shouldSetDefaultBackground = options.omitBackground && format === 'png';
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});

	const cap = Internals.perf.startPerfMeasure('capture');
	const result = await client.send('Page.captureScreenshot', {
		format,
		quality: options.quality,
		clip: undefined,
		captureBeyondViewport: true,
	});
	Internals.perf.stopPerfMeasure(cap);
	if (shouldSetDefaultBackground)
		await client.send('Emulation.setDefaultBackgroundColorOverride');

	const saveMarker = Internals.perf.startPerfMeasure('save');
	const buffer =
		options.encoding === 'base64'
			? result.data
			: Buffer.from(result.data, 'base64');

	if (options.path) await fs.promises.writeFile(options.path, buffer);
	Internals.perf.stopPerfMeasure(saveMarker);
	return buffer;
};
