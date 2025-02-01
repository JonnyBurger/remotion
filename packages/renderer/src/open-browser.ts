import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {NoReactInternals} from 'remotion/no-react';
import type {Browser} from './browser';
import {addHeadlessBrowser} from './browser-instances';
import type {HeadlessBrowser} from './browser/Browser';
import {defaultBrowserDownloadProgress} from './browser/browser-download-progress-bar';
import {launchChrome} from './browser/Launcher';
import type {Viewport} from './browser/PuppeteerViewport';
import {internalEnsureBrowser} from './ensure-browser';
import {getLocalBrowserExecutable} from './get-local-browser-executable';
import {getIdealVideoThreadsFlag} from './get-video-threads-flag';
import {type LogLevel} from './log-level';
import {Log} from './logger';
import type {ChromeMode} from './options/chrome-mode';
import type {validOpenGlRenderers} from './options/gl';
import {DEFAULT_OPENGL_RENDERER, validateOpenGlRenderer} from './options/gl';
import type {ToOptions} from './options/option';
import type {optionsMap} from './options/options-map';

type OpenGlRenderer = (typeof validOpenGlRenderers)[number];

type OnlyV4Options =
	typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends true
		? {}
		: {
				/**
				 * @deprecated - Will be removed in v5.
				 * Chrome Headless shell does not allow disabling headless mode anymore.
				 */
				headless?: boolean;
			};

// ⚠️ When adding new options, also add them to the hash in lambda/get-browser-instance.ts!
export type ChromiumOptions = {
	ignoreCertificateErrors?: boolean;
	disableWebSecurity?: boolean;
	gl?: OpenGlRenderer | null;
	userAgent?: string | null;
	enableMultiProcessOnLinux?: boolean;
} & OnlyV4Options;

const featuresToEnable = (option?: OpenGlRenderer | null) => {
	const renderer = option ?? DEFAULT_OPENGL_RENDERER;

	const enableAlways = ['NetworkService', 'NetworkServiceInProcess'];

	if (renderer === 'vulkan') {
		return [...enableAlways, 'Vulkan', 'UseSkiaRenderer'];
	}

	if (renderer === 'angle-egl') {
		return [...enableAlways, 'VaapiVideoDecoder'];
	}

	return enableAlways;
};

const getOpenGlRenderer = (option?: OpenGlRenderer | null): string[] => {
	const renderer = option ?? DEFAULT_OPENGL_RENDERER;
	validateOpenGlRenderer(renderer);
	if (renderer === 'swangle') {
		return ['--use-gl=angle', '--use-angle=swiftshader'];
	}

	if (renderer === 'angle-egl') {
		return ['--use-gl=angle', '--use-angle=gl-egl'];
	}

	if (renderer === 'vulkan') {
		return [
			'--use-angle=vulkan',
			'--use-vulkan=native',
			'--disable-vulkan-fallback-to-gl-for-testing',
			'--disable-vulkan-surface',
			'--ignore-gpu-blocklist',
			'--enable-gpu',
		];
	}

	if (renderer === null) {
		return [];
	}

	return [`--use-gl=${renderer}`];
};

type InternalOpenBrowserOptions = {
	browserExecutable: string | null;
	chromiumOptions: ChromiumOptions;
	forceDeviceScaleFactor: number | undefined;
	viewport: Viewport | null;
	indent: boolean;
	browser: Browser;
} & ToOptions<typeof optionsMap.openBrowser>;

type LogOptions =
	typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends true
		? {
				logLevel?: LogLevel;
			}
		: {shouldDumpIo?: boolean; logLevel?: LogLevel};

export type OpenBrowserOptions = {
	browserExecutable?: string | null;
	chromiumOptions?: ChromiumOptions;
	chromeMode?: ChromeMode;
	forceDeviceScaleFactor?: number;
} & LogOptions;

export const internalOpenBrowser = async ({
	browser,
	browserExecutable,
	chromiumOptions,
	forceDeviceScaleFactor,
	indent,
	viewport,
	logLevel,
	onBrowserDownload,
	chromeMode,
}: InternalOpenBrowserOptions): Promise<HeadlessBrowser> => {
	// @ts-expect-error Firefox
	if (browser === 'firefox') {
		throw new TypeError(
			'Firefox supported is not yet turned on. Stay tuned for the future.',
		);
	}

	await internalEnsureBrowser({
		browserExecutable,
		logLevel,
		indent,
		onBrowserDownload,
		chromeMode,
	});

	const executablePath = getLocalBrowserExecutable({
		preferredBrowserExecutable: browserExecutable,
		logLevel,
		indent,
		chromeMode,
	});

	const customGlRenderer = getOpenGlRenderer(chromiumOptions.gl ?? null);
	const enableMultiProcessOnLinux =
		chromiumOptions.enableMultiProcessOnLinux ?? true;

	Log.verbose(
		{indent, logLevel, tag: 'openBrowser()'},
		`Opening browser: gl = ${chromiumOptions.gl}, executable = ${executablePath}, enableMultiProcessOnLinux = ${enableMultiProcessOnLinux}`,
	);

	if (chromiumOptions.userAgent) {
		Log.verbose(
			{indent, logLevel: 'verbose', tag: 'openBrowser()'},
			`Using custom user agent: ${chromiumOptions.userAgent}`,
		);
	}

	const userDataDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'puppeteer_dev_chrome_profile-'),
	);

	const browserInstance = await launchChrome({
		executablePath,
		logLevel,
		indent,
		userDataDir,
		args: [
			'about:blank',
			'--allow-pre-commit-input',
			'--disable-background-networking',
			`--enable-features=${featuresToEnable(chromiumOptions.gl).join(',')}`,
			'--disable-background-timer-throttling',
			'--disable-backgrounding-occluded-windows',
			'--disable-breakpad',
			'--disable-client-side-phishing-detection',
			'--disable-component-extensions-with-background-pages',
			'--disable-default-apps',
			'--disable-dev-shm-usage',
			'--no-proxy-server',
			"--proxy-server='direct://'",
			'--proxy-bypass-list=*',
			'--force-gpu-mem-available-mb=4096',
			'--disable-hang-monitor',
			'--disable-extensions',
			'--allow-chrome-scheme-url',
			'--disable-ipc-flooding-protection',
			'--disable-popup-blocking',
			'--disable-prompt-on-repost',
			'--disable-renderer-backgrounding',
			'--disable-sync',
			'--force-color-profile=srgb',
			'--metrics-recording-only',
			'--mute-audio',
			'--no-first-run',
			`--video-threads=${getIdealVideoThreadsFlag(logLevel)}`,
			'--enable-automation',
			'--password-store=basic',
			'--use-mock-keychain',
			'--enable-blink-features=IdleDetection',
			'--export-tagged-pdf',
			'--intensive-wake-up-throttling-policy=0',
			chromeMode === 'chrome-for-testing' ? '--headless=new' : '--headless=old',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			...customGlRenderer,
			'--disable-background-media-suspend',
			process.platform === 'linux' &&
			chromiumOptions.gl !== 'vulkan' &&
			!enableMultiProcessOnLinux
				? '--single-process'
				: null,
			'--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
			'--disable-component-update', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
			'--disable-domain-reliability', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
			'--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process,Translate,BackForwardCache,AvoidUnnecessaryBeforeUnloadCheckSync,IntensiveWakeUpThrottling', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
			'--disable-print-preview', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
			'--disable-site-isolation-trials', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
			'--disk-cache-size=268435456', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
			'--hide-scrollbars', // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
			'--no-default-browser-check', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
			'--no-pings', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
			'--font-render-hinting=none',
			'--no-zygote', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium,
			'--ignore-gpu-blocklist',
			'--enable-unsafe-webgpu',
			typeof forceDeviceScaleFactor === 'undefined'
				? null
				: `--force-device-scale-factor=${forceDeviceScaleFactor}`,
			chromiumOptions.ignoreCertificateErrors
				? '--ignore-certificate-errors'
				: null,
			...(chromiumOptions?.disableWebSecurity
				? ['--disable-web-security']
				: []),
			chromiumOptions?.userAgent
				? `--user-agent="${chromiumOptions.userAgent}"`
				: null,
			'--remote-debugging-port=0',
			`--user-data-dir=${userDataDir}`,
		].filter(Boolean) as string[],
		defaultViewport: viewport ?? {
			height: 720,
			width: 1280,
			deviceScaleFactor: 1,
		},
	});

	const pages = await browserInstance.pages();
	await pages[0]?.close();

	addHeadlessBrowser(browserInstance);
	return browserInstance;
};

/*
 * @description Opens a Chrome or Chromium browser instance. By reusing an instance across various rendering and compositional API calls, significant time can be saved by avoiding the repeated opening and closing of browsers.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/open-browser)
 */
export const openBrowser = (
	browser: Browser,
	options?: OpenBrowserOptions,
): Promise<HeadlessBrowser> => {
	const {browserExecutable, chromiumOptions, forceDeviceScaleFactor} =
		options ?? {};

	const indent = false;
	const logLevel = options?.logLevel ?? 'info';

	return internalOpenBrowser({
		browser,
		browserExecutable: browserExecutable ?? null,
		chromiumOptions: chromiumOptions ?? {},
		forceDeviceScaleFactor,
		indent,
		viewport: null,
		logLevel,
		onBrowserDownload: defaultBrowserDownloadProgress({
			indent,
			logLevel,
			api: 'openBrowser()',
		}),
		chromeMode: options?.chromeMode ?? 'headless-shell',
	});
};
