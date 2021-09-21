import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {deployFunction} from '../../../api/deploy-function';
import {ensureLambdaBinaries} from '../../../api/ensure-lambda-binaries';
import {
	CURRENT_VERSION,
	DEFAULT_MEMORY_SIZE,
	DEFAULT_TIMEOUT,
} from '../../../shared/constants';
import {validateMemorySize} from '../../../shared/validate-memory-size';
import {validateTimeout} from '../../../shared/validate-timeout';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';

export const FUNCTIONS_DEPLOY_SUBCOMMAND = 'deploy';

export const functionsDeploySubcommand = async () => {
	// TODO: Should only allow one lambda to be deployed
	const region = getAwsRegion();
	const timeoutInSeconds = parsedLambdaCli.timeout ?? DEFAULT_TIMEOUT;
	const memorySizeInMb = parsedLambdaCli.memory ?? DEFAULT_MEMORY_SIZE;
	validateMemorySize(memorySizeInMb);
	validateTimeout(timeoutInSeconds);
	Log.info(
		CliInternals.chalk.gray(
			`Region = ${region}, Memory = ${memorySizeInMb}MB, Timeout = ${timeoutInSeconds}sec, Version = ${CURRENT_VERSION}`
		)
	);
	const output = CliInternals.createOverwriteableCliOutput();
	output.update('Ensuring Lambda binaries...');
	// TODO: Output can be more finegrained
	const {layerArn} = await ensureLambdaBinaries(getAwsRegion());
	output.update('Bundling lambda and deploying...');
	const {functionName} = await deployFunction({
		region,
		timeoutInSeconds,
		layerArn,
		memorySizeInMb,
	});
	output.update(`Deployed to ${functionName}\n`);
};
