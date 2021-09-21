import minimist from 'minimist';
import {
	BrowserExecutable,
	Codec,
	Config,
	ImageFormat,
	Internals,
	LogLevel,
	PixelFormat,
	ProResProfile,
} from 'remotion';
import {Log} from './log';

export type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: ImageFormat;
	['prores-profile']: ProResProfile;
	['bundle-cache']: string;
	['env-file']: string;
	['frames-per-lambda']: number;
	codec: Codec;
	concurrency: number;
	config: string;
	crf: number;
	force: boolean;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	frames: string | number;
	sequence: boolean;
	log: string;
	help: boolean;
	port: number;
	frame: string | number;
};

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: ['force', 'overwrite', 'sequence', 'help'],
});

export const parseCommandLine = (
	type: 'still' | 'sequence' | 'lambda' | 'preview'
) => {
	if (parsedCli['pixel-format']) {
		Config.Output.setPixelFormat(parsedCli['pixel-format']);
	}

	if (parsedCli['image-format']) {
		Config.Rendering.setImageFormat(parsedCli['image-format']);
	}

	if (parsedCli['browser-executable']) {
		Config.Puppeteer.setBrowserExecutable(parsedCli['browser-executable']);
	}

	if (typeof parsedCli['bundle-cache'] !== 'undefined') {
		Config.Bundling.setCachingEnabled(parsedCli['bundle-cache'] !== 'false');
	}

	if (parsedCli.log) {
		if (!Internals.Logging.isValidLogLevel(parsedCli.log)) {
			Log.error('Invalid `--log` value passed.');
			Log.error(
				`Accepted values: ${Internals.Logging.logLevels
					.map((l) => `'${l}'`)
					.join(', ')}.`
			);
			process.exit(1);
		}

		Internals.Logging.setLogLevel(parsedCli.log as LogLevel);
	}

	if (parsedCli.concurrency) {
		Config.Rendering.setConcurrency(parsedCli.concurrency);
	}

	if (parsedCli.frames) {
		if (type === 'still') {
			Log.error(
				'--frames flag was passed to the `still` command. This flag only works with the `render` command. Did you mean `--frame`? See reference: https://www.remotion.dev/docs/cli/'
			);
			process.exit(1);
		}

		Internals.setFrameRangeFromCli(parsedCli.frames);
	}

	if (parsedCli.frame) {
		if (type === 'sequence') {
			Log.error(
				'--frame flag was passed to the `render` command. This flag only works with the `still` command. Did you mean `--frames`? See reference: https://www.remotion.dev/docs/cli/'
			);
			process.exit(1);
		}

		Internals.setStillFrame(Number(parsedCli.frame));
	}

	if (parsedCli['frames-per-lambda']) {
		Internals.setFramesPerLambda(parsedCli['frames-per-lambda']);
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

	if (parsedCli.codec) {
		Config.Output.setCodec(parsedCli.codec);
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
};
