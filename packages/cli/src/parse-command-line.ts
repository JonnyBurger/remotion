import type {
	BrowserExecutable,
	Codec,
	FfmpegExecutable,
	ImageFormat,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import minimist from 'minimist';
import {resolve} from 'path';
import {Config, ConfigInternals} from './config';
import {Log} from './log';

export type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['ffmpeg-executable']: FfmpegExecutable;
	['ffprobe-executable']: FfmpegExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: ImageFormat;
	['prores-profile']: ProResProfile;
	['bundle-cache']: string;
	['env-file']: string;
	['ignore-certificate-errors']: string;
	['disable-web-security']: string;
	['every-nth-frame']: number;
	['number-of-gif-loops']: number;
	['number-of-shared-audio-tags']: number;
	codec: Codec;
	concurrency: number;
	timeout: number;
	config: string;
	['public-dir']: string;
	['audio-bitrate']: string;
	['video-bitrate']: string;
	crf: number;
	force: boolean;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	frames: string | number;
	scale: number;
	sequence: boolean;
	quiet: boolean;
	q: boolean;
	log: string;
	help: boolean;
	port: number;
	frame: string | number;
	['disable-headless']: boolean;
	['disable-keyboard-shortcuts']: boolean;
	muted: boolean;
	height: number;
	width: number;
	runs: number;
	concurrencies: string;
	['enforce-audio-track']: boolean;
	gl: OpenGlRenderer;
	['package-manager']: string;
	['webpack-poll']: number;
	['no-open']: boolean;
};

export const BooleanFlags = [
	'force',
	'overwrite',
	'sequence',
	'help',
	'quiet',
	'q',
	'muted',
	'enforce-audio-track',
	// Lambda flags
	'force',
	'disable-chunk-optimization',
	'save-browser-logs',
	'disable-cloudwatch',
	'yes',
	'y',
	'disable-web-security',
	'ignore-certificate-errors',
	'disable-headless',
	'disable-keyboard-shortcuts',
	'default-only',
	'no-open',
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
}) as CommandLineOptions & {
	_: string[];
};

export const parseCommandLine = () => {
	if (parsedCli['pixel-format']) {
		Config.Output.setPixelFormat(parsedCli['pixel-format']);
	}

	if (parsedCli['image-format']) {
		Config.Rendering.setImageFormat(parsedCli['image-format']);
	}

	if (parsedCli['browser-executable']) {
		Config.Puppeteer.setBrowserExecutable(parsedCli['browser-executable']);
	}

	if (parsedCli['ffmpeg-executable']) {
		Config.Rendering.setFfmpegExecutable(
			resolve(parsedCli['ffmpeg-executable'])
		);
	}

	if (parsedCli['number-of-gif-loops']) {
		Config.Rendering.setNumberOfGifLoops(parsedCli['number-of-gif-loops']);
	}

	if (parsedCli['ffprobe-executable']) {
		Config.Rendering.setFfprobeExecutable(
			resolve(parsedCli['ffprobe-executable'])
		);
	}

	if (typeof parsedCli['bundle-cache'] !== 'undefined') {
		Config.Bundling.setCachingEnabled(parsedCli['bundle-cache'] !== 'false');
	}

	if (parsedCli['disable-web-security']) {
		Config.Puppeteer.setChromiumDisableWebSecurity(true);
	}

	if (parsedCli['ignore-certificate-errors']) {
		Config.Puppeteer.setChromiumIgnoreCertificateErrors(true);
	}

	if (parsedCli['disable-headless']) {
		Config.Puppeteer.setChromiumHeadlessMode(false);
	}

	if (parsedCli.log) {
		if (!RenderInternals.isValidLogLevel(parsedCli.log)) {
			Log.error('Invalid `--log` value passed.');
			Log.error(
				`Accepted values: ${RenderInternals.logLevels
					.map((l) => `'${l}'`)
					.join(', ')}.`
			);
			process.exit(1);
		}

		ConfigInternals.Logging.setLogLevel(parsedCli.log as LogLevel);
	}

	if (parsedCli.concurrency) {
		Config.Rendering.setConcurrency(parsedCli.concurrency);
	}

	if (parsedCli.timeout) {
		Config.Puppeteer.setTimeoutInMilliseconds(parsedCli.timeout);
	}

	if (parsedCli.height) {
		Config.Output.overrideHeight(parsedCli.height);
	}

	if (parsedCli.width) {
		Config.Output.overrideWidth(parsedCli.width);
	}

	if (parsedCli.frames) {
		ConfigInternals.setFrameRangeFromCli(parsedCli.frames);
	}

	if (parsedCli.frame) {
		ConfigInternals.setStillFrame(Number(parsedCli.frame));
	}

	if (parsedCli.png) {
		Log.warn(
			'The --png flag has been deprecrated. Use --sequence --image-format=png from now on.'
		);
		Config.Output.setImageSequence(true);
		Config.Rendering.setImageFormat('png');
	}

	if (parsedCli.sequence) {
		Config.Output.setImageSequence(true);
	}

	if (typeof parsedCli.crf !== 'undefined') {
		Config.Output.setCrf(parsedCli.crf);
	}

	if (parsedCli['every-nth-frame']) {
		Config.Rendering.setEveryNthFrame(parsedCli['every-nth-frame']);
	}

	if (parsedCli.gl) {
		Config.Puppeteer.setChromiumOpenGlRenderer(parsedCli.gl);
	}

	if (parsedCli['prores-profile']) {
		Config.Output.setProResProfile(
			String(parsedCli['prores-profile']) as ProResProfile
		);
	}

	if (parsedCli.overwrite) {
		Config.Output.setOverwriteOutput(parsedCli.overwrite);
	}

	if (typeof parsedCli.quality !== 'undefined') {
		Config.Rendering.setQuality(parsedCli.quality);
	}

	if (typeof parsedCli.scale !== 'undefined') {
		Config.Rendering.setScale(parsedCli.scale);
	}

	if (typeof parsedCli.port !== 'undefined') {
		Config.Bundling.setPort(parsedCli.port);
	}

	if (typeof parsedCli.muted !== 'undefined') {
		Config.Rendering.setMuted(parsedCli.muted);
	}

	if (typeof parsedCli['disable-keyboard-shortcuts'] !== 'undefined') {
		Config.Preview.setKeyboardShortcutsEnabled(
			!parsedCli['disable-keyboard-shortcuts']
		);
	}

	if (typeof parsedCli['enforce-audio-track'] !== 'undefined') {
		Config.Rendering.setEnforceAudioTrack(parsedCli['enforce-audio-track']);
	}

	if (typeof parsedCli['public-dir'] !== 'undefined') {
		Config.Bundling.setPublicDir(parsedCli['public-dir']);
	}

	if (typeof parsedCli['webpack-poll'] !== 'undefined') {
		Config.Preview.setWebpackPollingInMilliseconds(parsedCli['webpack-poll']);
	}

	if (typeof parsedCli['audio-bitrate'] !== 'undefined') {
		Config.Output.setAudioBitrate(parsedCli['audio-bitrate']);
	}

	if (typeof parsedCli['video-bitrate'] !== 'undefined') {
		Config.Output.setVideoBitrate(parsedCli['video-bitrate']);
	}
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
