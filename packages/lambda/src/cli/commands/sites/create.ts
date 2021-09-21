import {CliInternals} from '@remotion/cli';
import {existsSync, lstatSync} from 'fs';
import path from 'path';
import {deploySite} from '../../../api/deploy-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../shared/constants';
import {getAwsRegion} from '../../get-aws-region';
import {
	BucketCreationProgress,
	BundleProgress,
	DeployToS3Progress,
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
} from '../../helpers/progress-bar';
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
		process.exit(1);
	}

	const absoluteFile = path.join(process.cwd(), fileName);
	if (!existsSync(absoluteFile)) {
		Log.error(
			`No file exists at ${absoluteFile}. Make sure the path exists and try again.`
		);
		process.exit(1);
	}

	if (lstatSync(absoluteFile).isDirectory()) {
		Log.error(
			`You passed a path ${absoluteFile} but it is a directory. Pass a file instead.`
		);
		process.exit(1);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput();

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

	const {bucketName} = await getOrCreateBucket({region: getAwsRegion()});
	multiProgress.bucketProgress = {
		bucketCreated: true,
		doneIn: null,
		websiteEnabled: false,
	};

	updateProgress();

	const bundleStart = Date.now();
	const bucketStart = Date.now();
	const uploadStart = Date.now();

	const {url} = await deploySite({
		entryPoint: absoluteFile,
		bucketName,
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
			onWebsiteActivated: () => {
				multiProgress.bucketProgress = {
					bucketCreated: true,
					doneIn: Date.now() - bucketStart,
					websiteEnabled: true,
				};
				updateProgress();
			},
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

	Log.info(url);
};
