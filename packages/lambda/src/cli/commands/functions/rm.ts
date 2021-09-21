import {CliInternals} from '@remotion/cli';
import {deleteFunction} from '../../../api/delete-function';
import {getFunctionInfo} from '../../../api/get-function-info';
import {BINARY_NAME} from '../../../shared/constants';
import {getAwsRegion} from '../../get-aws-region';
import {confirmCli} from '../../helpers/confirm';
import {Log} from '../../log';
import {FUNCTIONS_COMMAND} from './index';
import {FUNCTIONS_LS_SUBCOMMAND} from './ls';

export const FUNCTIONS_RM_SUBCOMMAND = 'rm';
const LEFT_COL = 16;

export const functionsRmCommand = async (args: string[]) => {
	const region = getAwsRegion();
	if (args.length === 0) {
		Log.error('No function name passed.');
		Log.error(
			'Pass another argument which is the name of the function you would like to remove.'
		);
		Log.info(
			`You can run \`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}\` to see a list of deployed Lambda functions.`
		);
		process.exit(1);
	}

	for (const functionName of args) {
		const infoOutput = CliInternals.createOverwriteableCliOutput();
		infoOutput.update('Getting function info...');
		const info = await getFunctionInfo({
			region,
			functionName,
		});

		infoOutput.update(
			[
				'Function name: '.padEnd(LEFT_COL, ' ') + ' ' + info.functionName,
				'Memory: '.padEnd(LEFT_COL, ' ') + ' ' + info.memorySizeInMb + 'MB',
				'Timeout: '.padEnd(LEFT_COL, ' ') + ' ' + info.timeoutInSeconds + 'sec',
				'Version: '.padEnd(LEFT_COL, ' ') + ' ' + info.version,
			].join('\n')
		);
		Log.info();

		await confirmCli({delMessage: 'Delete? (Y/n)', allowForceFlag: true});
		const output = CliInternals.createOverwriteableCliOutput();
		output.update('Deleting...');
		await deleteFunction({region, functionName});
		output.update('Deleted!\n');
	}
};
