import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {getFunctions} from '../../../api/get-functions';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';

const NAME_COLS = 32;
const MEMORY_COLS = 15;
const TIMEOUT_COLS = 15;
const VERSION_COLS = 15;

export const FUNCTIONS_LS_SUBCOMMAND = 'ls';

export const functionsLsCommand = async () => {
	const region = getAwsRegion();
	const fetchingOutput = CliInternals.createOverwriteableCliOutput();
	const quiet = Boolean(parsedLambdaCli.q);
	if (!quiet) {
		fetchingOutput.update('Getting functions...');
	}

	const functions = await getFunctions({
		region,
		compatibleOnly: false,
	});

	if (quiet) {
		Log.info(functions.map((f) => f.functionName).join(' '));
		return;
	}

	fetchingOutput.update('Getting function info...');

	const pluralized = functions.length === 1 ? 'function' : 'functions';
	fetchingOutput.update(
		`${functions.length} ${pluralized} in the ${region} region`
	);
	Log.info();
	Log.info(
		CliInternals.chalk.gray(
			[
				'Name'.padEnd(NAME_COLS, ' '),
				'Version'.padEnd(VERSION_COLS, ' '),
				'Memory (MB)'.padEnd(MEMORY_COLS, ' '),
				'Timeout (sec)'.padEnd(TIMEOUT_COLS, ' '),
			].join('')
		)
	);

	for (const datapoint of functions) {
		Log.info(
			[
				datapoint.functionName.padEnd(NAME_COLS, ' '),
				datapoint.version.padEnd(VERSION_COLS, ' '),
				String(datapoint.memorySizeInMb).padEnd(MEMORY_COLS, ' '),
				String(datapoint.timeoutInSeconds).padEnd(TIMEOUT_COLS, ' '),
			].join('')
		);
	}
};
