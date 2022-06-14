import {Internals, WebpackOverrideFn} from 'remotion';
import {deleteSite} from '../api/delete-site';
import {AwsRegion} from '../pricing/aws-regions';
import {bundleSite} from '../shared/bundle-site';
import {getSitesKey} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {makeS3ServeUrl} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateBucketName} from '../shared/validate-bucketname';
import {validateSiteName} from '../shared/validate-site-name';
import {bucketExistsInRegion} from './bucket-exists';
import {enableS3Website} from './enable-s3-website';
import {uploadDir, UploadDirProgress} from './upload-dir';

export type DeploySiteInput = {
	entryPoint: string;
	bucketName: string | Promise<string>;
	region: AwsRegion;
	siteName?: string;
	options?: {
		onBundleProgress?: (progress: number) => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
		webpackOverride?: WebpackOverrideFn;
		enableCaching?: boolean;
	};
};

export type DeploySiteOutput = Promise<{
	serveUrl: string;
	siteName: string;
}>;

/**
 * @description Deploys a Remotion project to an S3 bucket to prepare it for rendering on AWS Lambda.
 * @link https://remotion.dev/docs/lambda/deploysite
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.entryPoint An absolute path to the entry file of your Remotion project.
 * @param {string} params.bucketName The name of the bucket to deploy your project into.
 * @param {string} params.siteName The name of the folder in which the project gets deployed to.
 * @param {object} params.options Further options, see documentation page for this function.
 */
export const deploySite = async ({
	bucketName: bucketNameOrPromise,
	entryPoint,
	siteName,
	options,
	region,
}: DeploySiteInput): DeploySiteOutput => {
	validateAwsRegion(region);

	const siteId = siteName ?? randomHash();
	validateSiteName(siteId);

	const subFolder = getSitesKey(siteId);
	const bundled = bundleSite(
		entryPoint,
		options?.onBundleProgress ?? (() => undefined),
		{
			publicPath: `/${subFolder}/`,
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			enableCaching: options?.enableCaching ?? Internals.getWebpackCaching(),
		}
	);

	const bucketName = await bucketNameOrPromise;

	validateBucketName(bucketName, {mustStartWithRemotion: true});
	const bucketExists = await bucketExistsInRegion({
		bucketName,
		region,
		expectedBucketOwner: await getAccountId({region}),
	});
	if (!bucketExists) {
		throw new Error(`No bucket with the name ${bucketName} exists`);
	}

	await deleteSite({
		bucketName,
		onAfterItemDeleted: () => undefined,
		region,
		siteName: siteId,
	});

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			region,
			dir: await bundled,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			folder: subFolder,
			privacy: 'public',
		}),
		enableS3Website({
			region,
			bucketName,
		}),
	]);

	return {
		serveUrl: makeS3ServeUrl({bucketName, subFolder, region}),
		siteName: siteId,
	};
};
