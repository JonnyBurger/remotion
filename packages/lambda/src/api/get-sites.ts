import {lambdaLs} from '../functions/helpers/io';
import {AwsRegion} from '../pricing/aws-regions';
import {getSitesKey} from '../shared/constants';
import {getRemotionS3Buckets} from './get-buckets';

type Site = {
	size: number;
	lastModified: number | null;
	bucketName: string;
	id: string;
};

// TODO: Add JSDoc comments
export const getSites = async ({region}: {region: AwsRegion}) => {
	const {remotionBuckets} = await getRemotionS3Buckets(region);

	const sites: {[key: string]: Site} = {};

	for (const bucket of remotionBuckets) {
		const ls = await lambdaLs({
			bucketName: bucket.Name as string,
			prefix: getSitesKey(''),
			region,
			expectedBucketOwner: null,
		});

		for (const file of ls) {
			const siteKeyMatch = file.Key?.match(/sites\/(.*)\/(.*)$/);
			if (!siteKeyMatch) {
				throw new Error(
					`An file was found in the bucket "${bucket.Name}" with the key ${file.Key} which is an unexpected folder structure. Delete this file.`
				);
			}

			const [, siteId] = siteKeyMatch;
			if (!sites[siteId]) {
				sites[siteId] = {
					size: 0,
					bucketName: bucket.Name as string,
					lastModified: null,
					id: siteId,
				};
			}

			if (file.LastModified) {
				const currentLastModified = sites[siteId].lastModified;
				if (
					currentLastModified === null ||
					file.LastModified.getTime() > currentLastModified
				) {
					sites[siteId].lastModified = file.LastModified.getTime();
				}
			}

			if (file.Size) {
				sites[siteId].size += file.Size;
			}
		}
	}

	const sitesArray: Site[] = Object.keys(sites).map((siteId) => {
		return sites[siteId];
	});
	return {sites: sitesArray, buckets: remotionBuckets};
};
