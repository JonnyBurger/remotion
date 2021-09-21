import {CliInternals} from '@remotion/cli';
import {deleteSite} from '../../../api/delete-site';
import {getRemotionS3Buckets} from '../../../api/get-buckets';
import {getAwsRegion} from '../../get-aws-region';
import {formatBytes} from '../../helpers/format-bytes';
import {Log} from '../../log';
export const SITES_RM_COMMAND = 'rm';

export const sitesRmSubcommand = async (args: string[]) => {
	const siteName = args[0];
	if (!siteName) {
		Log.error(
			'No site name was passed. Run the command again and pass another argument <site-name>.'
		);
		process.exit(1);
	}

	const region = getAwsRegion();
	const {remotionBuckets} = await getRemotionS3Buckets(region);

	if (remotionBuckets.length > 1) {
		Log.error(
			'You have more than one Remotion Lambda bucket. You should only have one - delete all but one before continuing.'
		);
		process.exit(1);
	}

	if (remotionBuckets.length === 0) {
		Log.error(
			`You don't have a Remotion Lambda bucket in the ${region} region. Therefore nothing was deleted.`
		);
		process.exit(1);
	}

	const {totalSize} = await deleteSite({
		bucketName: remotionBuckets[0].Name as string,
		siteName,
		region,
		onAfterItemDeleted: ({itemName}) => {
			Log.info(CliInternals.chalk.gray(`Deleted ${itemName}`));
		},
	});

	Log.info(`Deleted site ${siteName} and freed up ${formatBytes(totalSize)}.`);
};
