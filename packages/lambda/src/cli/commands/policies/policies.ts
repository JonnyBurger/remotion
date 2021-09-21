import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../../../shared/constants';
import {Log} from '../../log';
import {roleSubcommand, ROLE_SUBCOMMAND} from './role';
import {userSubcommand, USER_SUBCOMMAND} from './user';
import {validateSubcommand, VALIDATE_SUBCOMMAND} from './validate';

export const POLICIES_COMMAND = 'policies';

const printPoliciesHelp = () => {
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${USER_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the user that is attached to the access token.'
		)
	);
	Log.info();
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${ROLE_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Print the suggested policy to be applied to the role that is attached to the lambda function.'
		)
	);
	Log.info();
	Log.info(`${BINARY_NAME} ${POLICIES_COMMAND} ${VALIDATE_SUBCOMMAND}`);
	Log.info(
		CliInternals.chalk.gray(
			'Validate the current policies setup is correct by running tests using the AWS policy simulator.'
		)
	);
};

export const policiesCommand = (args: string[]) => {
	if (args[0] === USER_SUBCOMMAND) {
		return userSubcommand();
	}

	if (args[0] === ROLE_SUBCOMMAND) {
		return roleSubcommand();
	}

	if (args[0] === VALIDATE_SUBCOMMAND) {
		return validateSubcommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printPoliciesHelp();
		process.exit(1);
	}

	printPoliciesHelp();
};
