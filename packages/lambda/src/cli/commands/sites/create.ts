import {CliInternals} from '@remotion/cli';
import {existsSync, lstatSync} from 'fs';
import path from 'path';
import {Internals} from 'remotion';
import {deploySite} from '../../../api/deploy-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../shared/constants';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {
	BucketCreationProgress,
	BundleProgress,
	DeployToS3Progress,
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_CREATE_SUBCOMMAND = 'create';

export const sitesCreateSubcommand = async (args: string[]) => {
	const fileName = args[0];
	if (!fileName) {
		Log.error('No entry file passed.');
		Log.info(
			'Pass an additional argument specifying the entry file of your Remotion project:'
		);
		Log.info();
		Log.info(`${BINARY_NAME} deploy <entry-file.ts>`);
		quit(1);
	}

	const absoluteFile = path.join(process.cwd(), fileName);
	if (!existsSync(absoluteFile)) {
		Log.error(
			`No file exists at ${absoluteFile}. Make sure the path exists and try again.`
		);
		quit(1);
	}

	if (lstatSync(absoluteFile).isDirectory()) {
		Log.error(
			`You passed a path ${absoluteFile} but it is a directory. Pass a file instead.`
		);
		quit(1);
	}

	const desiredSiteName = parsedLambdaCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToS3Progress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			bucketCreated: false,
			doneIn: null,
			websiteEnabled: false,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
		},
	};

	const updateProgress = () => {
		progressBar.update(
			[
				makeBundleProgress(multiProgress.bundleProgress),
				makeBucketProgress(multiProgress.bucketProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			].join('\n')
		);
	};

	const bucketStart = Date.now();

	const prom = getOrCreateBucket({
		region: getAwsRegion(),
		onBucketEnsured: () => {
			multiProgress.bucketProgress.bucketCreated = true;
			updateProgress();
		},
	});

	const bundleStart = Date.now();
	const uploadStart = Date.now();

	const {serveUrl, siteName} = await deploySite({
		entryPoint: absoluteFile,
		siteName: desiredSiteName,
		bucketName: prom.then((p) => {
			multiProgress.bucketProgress.websiteEnabled = true;
			multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
			updateProgress();
			return p.bucketName;
		}),

		options: {
			onBundleProgress: (progress: number) => {
				multiProgress.bundleProgress = {
					progress,
					doneIn: progress === 100 ? Date.now() - bundleStart : null,
				};
			},
			onUploadProgress: (p) => {
				multiProgress.deployProgress = {
					sizeUploaded: p.sizeUploaded,
					totalSize: p.totalSize,
					doneIn: null,
				};
				updateProgress();
			},
			enableCaching: Internals.getWebpackCaching(),
			webpackOverride:
				Internals.getWebpackOverrideFn() ?? Internals.defaultOverrideFunction,
		},
		region: getAwsRegion(),
	});
	const uploadDuration = Date.now() - uploadStart;
	multiProgress.deployProgress = {
		sizeUploaded: 1,
		totalSize: 1,
		doneIn: uploadDuration,
	};
	updateProgress();

	Log.info();
	Log.info();
	Log.info('Deployed to S3!');

	Log.info(`Serve URL: ${serveUrl}`);
	Log.info(`Site Name: ${siteName}`);
};
