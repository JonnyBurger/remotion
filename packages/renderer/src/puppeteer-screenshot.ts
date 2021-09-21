import * as assert from 'assert';
import {Page, ScreenshotOptions} from 'puppeteer-core';
import {StillImageFormat} from 'remotion';
import {_screenshotTask} from './screenshot-task';

export const screenshot = async (
	page: Page,
	options: ScreenshotOptions = {}
): Promise<Buffer | string | void> => {
	let screenshotType: 'png' | 'jpeg' | null = null;
	// options.type takes precedence over inferring the type from options.path
	// because it may be a 0-length file with no extension created beforehand
	// (i.e. as a temp file).
	if (options.type) {
		assert.ok(
			options.type === 'png' || options.type === 'jpeg',
			'Unknown options.type value: ' + options.type
		);
		screenshotType = options.type;
	} else if (options.path) {
		const filePath = options.path;
		const extension = filePath
			.slice(filePath.lastIndexOf('.') + 1)
			.toLowerCase();
		if (extension === 'png') screenshotType = 'png';
		else if (extension === 'jpg' || extension === 'jpeg')
			screenshotType = 'jpeg';
		assert.ok(
			screenshotType,
			`Unsupported screenshot type for extension \`.${extension}\``
		);
	}

	if (!screenshotType) screenshotType = 'png';

	if (options.quality) {
		assert.ok(
			screenshotType === 'jpeg',
			'options.quality is unsupported for the ' +
				screenshotType +
				' screenshots'
		);
		assert.ok(
			typeof options.quality === 'number',
			'Expected options.quality to be a number but found ' +
				typeof options.quality
		);
		assert.ok(
			Number.isInteger(options.quality),
			'Expected options.quality to be an integer'
		);
		assert.ok(
			options.quality >= 0 && options.quality <= 100,
			'Expected options.quality to be between 0 and 100 (inclusive), got ' +
				options.quality
		);
	}

	assert.ok(
		!options.clip || !options.fullPage,
		'options.clip and options.fullPage are exclusive'
	);
	if (options.clip) {
		assert.ok(
			typeof options.clip.x === 'number',
			'Expected options.clip.x to be a number but found ' +
				typeof options.clip.x
		);
		assert.ok(
			typeof options.clip.y === 'number',
			'Expected options.clip.y to be a number but found ' +
				typeof options.clip.y
		);
		assert.ok(
			typeof options.clip.width === 'number',
			'Expected options.clip.width to be a number but found ' +
				typeof options.clip.width
		);
		assert.ok(
			typeof options.clip.height === 'number',
			'Expected options.clip.height to be a number but found ' +
				typeof options.clip.height
		);
		assert.ok(
			options.clip.width !== 0,
			'Expected options.clip.width not to be 0.'
		);
		assert.ok(
			options.clip.height !== 0,
			'Expected options.clip.height not to be 0.'
		);
	}

	// @ts-expect-error
	return (page as Page)._screenshotTaskQueue.postTask(() =>
		_screenshotTask(page, screenshotType as StillImageFormat, options)
	);
};
