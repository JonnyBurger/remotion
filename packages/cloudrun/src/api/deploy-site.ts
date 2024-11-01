import {
	BundlerInternals,
	type GitSource,
	type WebpackOverrideFn,
} from '@remotion/bundler';
import type {ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import {cloudrunDeleteFile, cloudrunLs} from '../functions/helpers/io';
import {getSitesKey} from '../shared/constants';
import {getStorageDiffOperations} from '../shared/get-storage-operations';
import {makeStorageServeUrl} from '../shared/make-storage-url';
import {randomHash} from '../shared/random-hash';
import {validateBucketName} from '../shared/validate-bucketname';
import {validateSiteName} from '../shared/validate-site-name';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';
import type {UploadDirProgress} from './upload-dir';
import {uploadDir} from './upload-dir';

type Options = {
	onBundleProgress?: (progress: number) => void;
	onUploadProgress?: (upload: UploadDirProgress) => void;
	webpackOverride?: WebpackOverrideFn;
	ignoreRegisterRootWarning?: boolean;
	publicDir?: string | null;
	rootDir?: string;
	bypassBucketNameValidation?: boolean;
	gitSource?: GitSource | null;
};

type OptionalParameters = {
	siteName: string;
	options: Options;
} & ToOptions<typeof BrowserSafeApis.optionsMap.deploySiteCloudRun>;

export type RawDeploySiteInput = {
	entryPoint: string;
	bucketName: string;
	siteName: string;
	options: Options;
	indent: boolean;
} & OptionalParameters;

export type DeploySiteInput = {
	entryPoint: string;
	bucketName: string;
	siteName?: string;
	options?: Options;
} & Partial<OptionalParameters>;

export type DeploySiteOutput = Promise<{
	serveUrl: string;
	siteName: string;
	stats: {
		uploadedFiles: number;
		deletedFiles: number;
		untouchedFiles: number;
	};
}>;

export const internalDeploySiteRaw = async ({
	entryPoint,
	bucketName,
	siteName,
	options,
}: RawDeploySiteInput): DeploySiteOutput => {
	validateBucketName(bucketName, {mustStartWithRemotion: true});

	validateSiteName(siteName);

	const cloudStorageClient = getCloudStorageClient();

	// check if bucket exists
	await cloudStorageClient.bucket(bucketName).get();

	const subFolder = getSitesKey(siteName);

	// gcpLs is a function that lists all files in a bucket
	const [files, bundled] = await Promise.all([
		cloudrunLs({
			bucketName,
			prefix: subFolder,
		}),
		BundlerInternals.internalBundle({
			publicPath: `/${bucketName}/${subFolder}/`,
			webpackOverride: options?.webpackOverride ?? ((f) => f),
			publicDir: options?.publicDir ?? null,
			rootDir: options?.rootDir ?? null,
			ignoreRegisterRootWarning: options?.ignoreRegisterRootWarning ?? false,
			onProgress: options?.onBundleProgress ?? (() => undefined),
			entryPoint,
			gitSource: options?.gitSource ?? null,
			bufferStateDelayInMilliseconds: null,
			maxTimelineTracks: null,
			onDirectoryCreated: () => undefined,
			onPublicDirCopyProgress: () => undefined,
			onSymlinkDetected: () => undefined,
			outDir: null,
		}),
	]);

	const {toDelete, toUpload, existingCount} = await getStorageDiffOperations({
		objects: files,
		bundle: bundled,
		prefix: subFolder,
	});

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			localDir: bundled,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			keyPrefix: subFolder,
			toUpload,
		}),
		Promise.all(
			toDelete.map((d) => {
				return cloudrunDeleteFile({
					bucketName,
					key: d.name as string,
				});
			}),
		),
	]);

	return {
		serveUrl: makeStorageServeUrl({bucketName, subFolder}),
		siteName,
		stats: {
			uploadedFiles: toUpload.length,
			deletedFiles: toDelete.length,
			untouchedFiles: existingCount,
		},
	};
};

const errorHandled = wrapWithErrorHandling(internalDeploySiteRaw);
/**
 * @description Deploys a Remotion project to a GCP storage bucket to prepare it for rendering on Cloud Run.
 * @link https://remotion.dev/docs/cloudrun/deploysite
 * @param {string} params.entryPoint An absolute path to the entry file of your Remotion project.
 * @param {string} params.bucketName The name of the bucket to deploy your project into.
 * @param {string} params.siteName The name of the folder in which the project gets deployed to.
 * @param {object} params.options Further options, see documentation page for this function.
 */
export const deploySite = (input: DeploySiteInput): DeploySiteOutput => {
	return errorHandled({
		bucketName: input.bucketName,
		entryPoint: input.entryPoint,
		indent: false,
		logLevel: 'info',
		options: input.options ?? {},
		siteName: input.siteName ?? randomHash(),
	});
};
