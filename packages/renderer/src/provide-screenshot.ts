import puppeteer from 'puppeteer-core';
import {ImageFormat} from 'remotion';
import {screenshotDOMElement} from './screenshot-dom-element';

export const provideScreenshot = async ({
	page,
	imageFormat,
	options,
	quality,
}: {
	page: puppeteer.Page;
	imageFormat: ImageFormat;
	quality: number | undefined;
	options: {
		frame: number;
		output?: string;
	};
}): Promise<Buffer> => {
	// console.log(options.output);
	return screenshotDOMElement({
		page,
		opts: {
			path: options.output,
			selector: '#canvas',
		},
		imageFormat,
		quality,
	});
};
