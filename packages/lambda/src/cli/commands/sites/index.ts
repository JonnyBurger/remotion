import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';
import {sitesLsSubcommand, SITES_LS_SUBCOMMAND} from './ls';
import {sitesRmSubcommand, SITES_RM_COMMAND} from './rm';

export const SITES_COMMAND = 'sites';

const printSitesHelp = () => {
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info();
	Log.info(
		`${BINARY_NAME} ${SITES_COMMAND} ${SITES_CREATE_SUBCOMMAND} <entry-point>`
	);
	Log.info(
		CliInternals.chalk.gray('Creates a new site based on a Remotion project')
	);
	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} ${SITES_LS_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Lists the sites currently deployed'));
	Log.info();
	Log.info(`${BINARY_NAME} ${SITES_COMMAND} ${SITES_RM_COMMAND} <site-id>`);
	Log.info(CliInternals.chalk.gray('Remove a site from the S3 bucket.'));
};

export const sitesCommand = (args: string[]) => {
	if (args[0] === SITES_LS_SUBCOMMAND) {
		return sitesLsSubcommand();
	}

	if (args[0] === SITES_RM_COMMAND) {
		return sitesRmSubcommand(args.slice(1));
	}

	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(args.slice(1));
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printSitesHelp();
		process.exit(1);
	}

	printSitesHelp();
};
