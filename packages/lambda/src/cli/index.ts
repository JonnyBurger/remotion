import {CliInternals} from '@remotion/cli';
import {checkCredentials} from '../shared/check-credentials';
import {parsedLambdaCli} from './args';
import {cleanupCommand, CLEANUP_COMMAND} from './cleanup';
import {functionsCommand, FUNCTIONS_COMMAND} from './commands/functions';
import {policiesCommand, POLICIES_COMMAND} from './commands/policies/policies';
import {ROLE_SUBCOMMAND} from './commands/policies/role';
import {USER_SUBCOMMAND} from './commands/policies/user';
import {renderCommand, RENDER_COMMAND} from './commands/render';
import {sitesCommand, SITES_COMMAND} from './commands/sites';
import {stillCommand, STILL_COMMAND} from './commands/still';
import {printHelp} from './help';
import {Log} from './log';

const requiresCredentials = (args: string[]) => {
	if (args[0] === POLICIES_COMMAND) {
		if (args[1] === USER_SUBCOMMAND) {
			return false;
		}

		if (args[1] === ROLE_SUBCOMMAND) {
			return false;
		}
	}

	return true;
};

const matchCommand = async (args: string[]) => {
	if (parsedLambdaCli.help || args.length === 0) {
		printHelp();
		process.exit(0);
	}

	if (requiresCredentials(args)) {
		checkCredentials();
	}

	if (args[0] === RENDER_COMMAND) {
		return renderCommand(args.slice(1));
	}

	if (args[0] === STILL_COMMAND) {
		return stillCommand(args.slice(1));
	}

	if (args[0] === FUNCTIONS_COMMAND) {
		return functionsCommand(args.slice(1));
	}

	if (args[0] === CLEANUP_COMMAND) {
		return cleanupCommand(args.slice(1));
	}

	if (args[0] === POLICIES_COMMAND) {
		return policiesCommand(args.slice(1));
	}

	if (args[0] === SITES_COMMAND) {
		return sitesCommand(args.slice(1));
	}

	if (args[0] === 'upload') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda upload <entry-point>');
		Log.info('After: remotion lambda sites create <entry-point>');
		process.exit(1);
	}

	if (args[0] === 'deploy') {
		Log.info('The command has been renamed.');
		Log.info('Before: remotion-lambda deploy');
		Log.info('After: remotion lambda functions deploy');
		process.exit(1);
	}

	Log.error(`Command ${args[0]} not found.`);
	printHelp();
	process.exit(1);
};

export const executeCommand = async (args: string[]) => {
	try {
		await matchCommand(args);
	} catch (err) {
		const error = err as Error;
		if (
			error.stack?.includes('AccessDenied') ||
			error.stack?.includes('AccessDeniedException')
		) {
			// TODO: Explain permission problem
			Log.error('PERMISSION PROBLEM PUT HELPFUL MESSAGE HERE');
		}

		Log.error(error.stack);
		process.exit(1);
	}
};

export const cli = async () => {
	CliInternals.initializeRenderCli('lambda');

	await executeCommand(parsedLambdaCli._);
};
