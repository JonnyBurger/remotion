import {VERSION} from 'remotion/version';
import {getFunctions} from '../../api/get-functions';
import {BINARY_NAME} from '../../shared/constants';
import {FUNCTIONS_COMMAND} from '../commands/functions';
import {FUNCTIONS_DEPLOY_SUBCOMMAND} from '../commands/functions/deploy';
import {FUNCTIONS_LS_SUBCOMMAND} from '../commands/functions/ls';
import {FUNCTIONS_RM_SUBCOMMAND} from '../commands/functions/rm';
import {getAwsRegion} from '../get-aws-region';
import {Log} from '../log';
import {quit} from './quit';

export const findFunctionName = async () => {
	const remotionLambdas = await getFunctions({
		region: getAwsRegion(),
		compatibleOnly: false,
	});
	const lambdasWithMatchingVersion = remotionLambdas.filter(
		(l) => l.version === VERSION
	);

	if (lambdasWithMatchingVersion.length === 0) {
		Log.error(
			`No lambda functions with version ${VERSION} found in your account.`
		);
		if (remotionLambdas.length > 0) {
			Log.error(
				'Other functions were found, but are not compatible with this version of the CLI.'
			);
		}

		Log.info('Run');
		Log.info(
			`  npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_DEPLOY_SUBCOMMAND}`
		);
		Log.info(`to deploy a new lambda function.`);
		quit(1);
	}

	if (lambdasWithMatchingVersion.length > 1) {
		Log.error(
			'More than 1 lambda function found in your account. This is an error.'
		);
		Log.info(`Delete extraneous lambda functions in your AWS console or run`);
		Log.info(
			`  npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_RM_SUBCOMMAND} $(npx ${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND} -q) -y`
		);
		Log.info('to delete all lambda functions.');
		quit(1);
	}

	const {functionName} = lambdasWithMatchingVersion[0];

	return functionName;
};
