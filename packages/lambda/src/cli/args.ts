import minimist from 'minimist';
import {AwsRegion} from '../pricing/aws-regions';

type LambdaCommandLineOptions = {
	help: boolean;
	region: AwsRegion;
	memory: number;
	timeout: number;
	y: boolean;
	yes: boolean;
	force: boolean;
	f: boolean;
	quiet: boolean;
};

export const parsedLambdaCli = minimist<LambdaCommandLineOptions>(
	process.argv.slice(2),
	{boolean: ['q', 'quiet', 'force', 'yes', 'y', 'help']}
);

export const forceFlagProvided =
	parsedLambdaCli.f ||
	parsedLambdaCli.force ||
	parsedLambdaCli.yes ||
	parsedLambdaCli.y;
