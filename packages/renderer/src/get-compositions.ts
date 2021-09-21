import {Browser as PuppeteerBrowser, Page} from 'puppeteer-core';
import {Browser, BrowserExecutable, Internals, TCompMetadata} from 'remotion';
import {openBrowser} from './open-browser';
import {setPropsAndEnv} from './set-props-and-env';

type GetCompositionsConfig = {
	browser?: Browser;
	inputProps?: object | null;
	envVariables?: Record<string, string>;
	browserInstance?: PuppeteerBrowser;
	onError?: (errorData: {err: Error}) => void;
	browserExecutable?: BrowserExecutable;
};

const getPageAndCleanupFn = async ({
	passedInInstance,
	browser,
	browserExecutable,
}: {
	passedInInstance: PuppeteerBrowser | undefined;
	browser: Browser;
	browserExecutable: BrowserExecutable | null;
}): Promise<{
	cleanup: () => void;
	page: Page;
}> => {
	if (passedInInstance) {
		const page = await passedInInstance.newPage();
		return {
			page,
			cleanup: () => {
				// Close puppeteer page and don't wait for it to finish.
				// Keep browser open.
				page.close().catch((err) => {
					console.error('Was not able to close puppeteer page', err);
				});
			},
		};
	}

	const browserInstance = await openBrowser(
		browser || Internals.DEFAULT_BROWSER,
		{
			browserExecutable,
		}
	);
	const browserPage = await browserInstance.newPage();

	return {
		page: browserPage,
		cleanup: () => {
			// Close whole browser that was just created and don't wait for it to finish.
			browserInstance.close().catch((err) => {
				console.error('Was not able to close puppeteer page', err);
			});
		},
	};
};

export const getCompositions = async (
	serveUrl: string,
	config?: GetCompositionsConfig
): Promise<TCompMetadata[]> => {
	const {page, cleanup} = await getPageAndCleanupFn({
		passedInInstance: config?.browserInstance,
		browser: config?.browser ?? Internals.DEFAULT_BROWSER,
		browserExecutable: config?.browserExecutable ?? null,
	});

	page.on('error', (err) => {
		console.log(err);
		config?.onError?.({err: err as Error});
	});
	page.on('pageerror', (err) => {
		console.log(err);
		config?.onError?.({err: err as Error});
	});

	await setPropsAndEnv({
		inputProps: config?.inputProps,
		envVariables: config?.envVariables,
		page,
		serveUrl,
		initialFrame: 0,
	});

	const urlToVisit = `${serveUrl}/index.html?evaluation=true`;
	const pageRes = await page.goto(urlToVisit);
	if (pageRes.status() !== 200) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was not 200 as expected, but ${pageRes.status()}. Does the site you specified exist?`
		);
	}

	const isRemotionFn = await page.evaluate('window.getStaticCompositions');
	if (isRemotionFn === undefined) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined. However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.`
		);
	}

	await page.waitForFunction('window.ready === true');
	const result = await page.evaluate('window.getStaticCompositions()');

	cleanup();

	return result as TCompMetadata[];
};
