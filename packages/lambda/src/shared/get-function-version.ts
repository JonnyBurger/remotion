import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from './call-lambda';
import {COMMAND_NOT_FOUND, LambdaRoutines, LambdaVersions} from './constants';

export const getFunctionVersion = async ({
	functionName,
	region,
}: {
	functionName: string;
	region: AwsRegion;
}): Promise<LambdaVersions> => {
	try {
		const result = await callLambda({
			functionName,
			payload: {
				type: LambdaRoutines.info,
			},
			region,
			type: LambdaRoutines.info,
		});
		return result.version;
	} catch (err) {
		// Prerelease versions had no info command
		if ((err as Error).message.includes(COMMAND_NOT_FOUND)) {
			return 'n/a';
		}

		// Bug in certain version of AWS S3 kit
		if ((err as Error).message.includes('AWS CRT binary not present ')) {
			return 'n/a';
		}

		throw err;
	}
};
