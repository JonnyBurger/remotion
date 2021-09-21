import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {functionsDeploySubcommand, FUNCTIONS_DEPLOY_SUBCOMMAND} from './deploy';
import {functionsLsCommand, FUNCTIONS_LS_SUBCOMMAND} from './ls';
import {functionsRmCommand, FUNCTIONS_RM_SUBCOMMAND} from './rm';

export const FUNCTIONS_COMMAND = 'functions';

const printFunctionsHelp = () => {
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Lists the functions currently deployed'));
	Log.info('');
	Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`
	);
	Log.info(CliInternals.chalk.gray('Deploy a new Lambda function'));
	Log.info('');
	Log.info(
		`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} <function-name>`
	);
	Log.info(CliInternals.chalk.gray('Delete a Lambda function'));
};

export const functionsCommand = (args: string[]) => {
	if (args[0] === FUNCTIONS_LS_SUBCOMMAND) {
		return functionsLsCommand();
	}

	if (args[0] === FUNCTIONS_RM_SUBCOMMAND) {
		return functionsRmCommand(args.slice(1));
	}

	if (args[0] === FUNCTIONS_DEPLOY_SUBCOMMAND) {
		return functionsDeploySubcommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printFunctionsHelp();
		process.exit(1);
	}

	printFunctionsHelp();
};
