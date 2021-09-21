import {CliInternals} from '@remotion/cli';
import {getRenderProgress} from '../../api/get-render-progress';
import {renderVideoOnLambda} from '../../api/render-video-on-lambda';
import {BINARY_NAME, DEFAULT_FRAMES_PER_LAMBDA} from '../../shared/constants';
import {sleep} from '../../shared/sleep';
import {getAwsRegion} from '../get-aws-region';
import {findFunctionName} from '../helpers/find-function-name';
import {Log} from '../log';

export const RENDER_COMMAND = 'render';

export const renderCommand = async (args: string[]) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id>`);
		process.exit(1);
	}

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		// TODO: Rename serveURL
		Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id>`);
		process.exit(1);
	}

	// TODO: Further validate serveUrl

	const cliOptions = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const res = await renderVideoOnLambda({
		functionName,
		serveUrl,
		inputProps: cliOptions.inputProps,
		codec: cliOptions.codec as 'h264-mkv' | 'mp3' | 'aac' | 'wav',
		imageFormat: cliOptions.imageFormat,
		crf: cliOptions.crf ?? undefined,
		envVariables: cliOptions.envVariables,
		pixelFormat: cliOptions.pixelFormat,
		proResProfile: cliOptions.proResProfile,
		quality: cliOptions.quality,
		region: getAwsRegion(),
		// TODO: Unhardcode retries
		maxRetries: 3,
		composition,
		framesPerLambda: cliOptions.framesPerLambda ?? DEFAULT_FRAMES_PER_LAMBDA,
	});
	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const status = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
		});
		Log.info(status);
		if (status.done) {
			Log.info('Done! ' + res.bucketName);
			process.exit(0);
		}

		if (status.fatalErrorEncountered) {
			Log.error('Fatal error encountered. Exiting.');
			process.exit(1);
		}
	}
};
