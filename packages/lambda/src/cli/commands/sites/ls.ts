import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {getSites} from '../../../api/get-sites';
import {makeS3Url} from '../../../shared/make-s3-url';
import {getAwsRegion} from '../../get-aws-region';
import {dateString} from '../../helpers/date-string';
import {formatBytes} from '../../helpers/format-bytes';

export const SITES_LS_SUBCOMMAND = 'ls';

const COLS: [number, number, number, number] = [20, 30, 10, 15];

const logRow = (data: [string, string, string, string]) => {
	return [
		data[0].padEnd(COLS[0], ' '),
		data[1].padEnd(COLS[1], ' '),
		data[2].padEnd(COLS[2], ' '),
		String(data[3]).padEnd(COLS[3], ' '),
	].join('');
};

export const sitesLsSubcommand = async () => {
	const region = getAwsRegion();
	const {sites, buckets} = await getSites({region});

	if (buckets.length > 1) {
		Log.warn(
			'Warning: You have more than one Remotion S3 bucket, but only one is needed. This can lead to conflicts. Remove all but one of them.'
		);
	}

	const sitesPluralized = sites.length === 1 ? 'site' : 'sites';
	Log.info(`${sites.length} ${sitesPluralized} in the ${region} region.`);

	Log.info();
	Log.info(
		CliInternals.chalk.gray(
			logRow(['Site ID', 'Bucket', 'Size', 'Last updated'])
		)
	);

	for (const site of sites) {
		Log.info(
			logRow([
				site.id,
				site.bucketName,
				formatBytes(site.size),
				site.lastModified ? dateString(new Date(site.lastModified)) : 'n/a',
			])
		);
		Log.info(
			makeS3Url({
				bucketName: site.bucketName,
				region,
				subFolder: `sites/${site.id}`,
			})
		);
		Log.info();
	}
};
