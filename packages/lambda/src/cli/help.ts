import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../shared/constants';
import {CLEANUP_COMMAND} from './cleanup';
import {FUNCTIONS_COMMAND} from './commands/functions';
import {RENDER_COMMAND} from './commands/render';
import {STILL_COMMAND} from './commands/still';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} Jonny Burger`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');

	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <s3-url> <composition-id>`);
	Log.info(CliInternals.chalk.gray('Render a video in the cloud.'));

	Log.info(`${BINARY_NAME} ${STILL_COMMAND} <s3-url> <composiiton-id>`);
	Log.info(CliInternals.chalk.gray('Render a still image in the cloud.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${CLEANUP_COMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Delete Remotion-related infrastructure from your AWS account.'
		)
	);

	Log.info();
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND}`);
	Log.info(CliInternals.chalk.gray('Deploy and manage AWS Lambda functions.'));
};
