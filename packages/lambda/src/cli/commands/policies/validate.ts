import {
	logPermissionOutput,
	simulatePermissions,
} from '../../../api/iam-validation/simulate';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';

export const VALIDATE_SUBCOMMAND = 'validate';

export const validateSubcommand = async () => {
	try {
		await simulatePermissions({
			region: getAwsRegion(),
			onSimulation: (res) => {
				Log.info(logPermissionOutput(res));
			},
		});
	} catch (err) {
		Log.error('Did not have the required permissions on AWS:');
		Log.error(err);
	}
};
