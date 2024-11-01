import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {existsSync, lstatSync} from 'fs';
import {Internals} from 'remotion';
import {displaySiteInfo} from '.';
import {internalDeploySiteRaw} from '../../../api/deploy-site';
import {getOrCreateBucket} from '../../../api/get-or-create-bucket';
import {BINARY_NAME} from '../../../shared/constants';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedCloudrunCli} from '../../args';
import {getGcpRegion} from '../../get-gcp-region';
import type {
	BucketCreationProgress,
	BundleProgress,
	DeployToStorageProgress,
} from '../../helpers/progress-bar';
import {
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_CREATE_SUBCOMMAND = 'create';

export const sitesCreateSubcommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const {file, reason} = CliInternals.findEntryPoint({
		args,
		remotionRoot,
		logLevel,
		allowDirectory: false,
	});
	if (!file) {
		Log.error({indent: false, logLevel}, 'No entry file passed.');
		Log.info(
			{indent: false, logLevel},
			'Pass an additional argument specifying the entry file of your Remotion project:',
		);
		Log.info({indent: false, logLevel});
		Log.info(
			{indent: false, logLevel},
			`${BINARY_NAME} deploy <entry-file.ts>`,
		);
		quit(1);
		return;
	}

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		file,
		'Reason:',
		reason,
	);

	if (!existsSync(file)) {
		Log.error(
			{indent: false, logLevel},
			`No file exists at ${file}. Make sure the path exists and try again.`,
		);
		quit(1);
	}

	if (lstatSync(file).isDirectory()) {
		Log.error(
			{indent: false, logLevel},
			`You passed a path ${file} but it is a directory. Pass a file instead.`,
		);
		quit(1);
	}

	const desiredSiteName = parsedCloudrunCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		updatesDontOverwrite: false,
		indent: false,
	});

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToStorageProgress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			doneIn: null,
			creationState: 'Checking bucket',
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
			stats: null,
		},
	};

	const updateProgress = (newLine: boolean) => {
		progressBar.update(
			[
				makeBundleProgress(multiProgress.bundleProgress),
				makeBucketProgress(multiProgress.bucketProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			].join('\n'),
			newLine,
		);
	};

	const bucketStart = Date.now();

	const region = getGcpRegion();

	const {bucketName} = await getOrCreateBucket({
		region,
		updateBucketState: (state) => {
			multiProgress.bucketProgress.creationState = state;
			updateProgress(false);
		},
	});

	multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
	updateProgress(false);

	const bundleStart = Date.now();
	let uploadStart = Date.now();

	const disableGitSource =
		BrowserSafeApis.options.disableGitSourceOption.getValue({
			commandLine: CliInternals.parsedCli,
		}).value;

	const gitSource = CliInternals.getGitSource({remotionRoot, disableGitSource});

	const {serveUrl, siteName, stats} = await internalDeploySiteRaw({
		entryPoint: file,
		siteName: desiredSiteName,
		bucketName,
		options: {
			onBundleProgress: (progress: number) => {
				multiProgress.bundleProgress = {
					progress,
					doneIn: progress === 100 ? Date.now() - bundleStart : null,
				};
				if (progress === 100) {
					uploadStart = Date.now();
				}
			},
			onUploadProgress: (p) => {
				multiProgress.deployProgress = {
					sizeUploaded: p.sizeUploaded,
					totalSize: p.totalSize,
					doneIn: null,
					stats: null,
				};
				updateProgress(false);
			},
			webpackOverride: ConfigInternals.getWebpackOverrideFn() ?? ((f) => f),
			gitSource,
			bypassBucketNameValidation: true,
			ignoreRegisterRootWarning: true,
			publicDir: null,
			rootDir: remotionRoot,
		},
		indent: false,
		logLevel,
	});

	updateProgress(false);

	const uploadDuration = Date.now() - uploadStart;

	multiProgress.deployProgress = {
		sizeUploaded: 1,
		totalSize: 1,
		doneIn: uploadDuration,
		stats: {
			addedFiles: stats.uploadedFiles,
			removedFiles: stats.deletedFiles,
			untouchedFiles: stats.untouchedFiles,
		},
	};
	updateProgress(true);

	Log.info(
		{indent: false, logLevel},
		displaySiteInfo({
			bucketName,
			id: siteName,
			serveUrl,
			bucketRegion: region,
		}),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.blueBright(
			'ℹ️   Redeploy your site everytime you make changes to it. You can overwrite the existing site by running:',
		),
	);
	Log.info(
		{indent: false, logLevel},
		CliInternals.chalk.blueBright(
			['npx remotion cloudrun sites create', args[0], `--site-name=${siteName}`]
				.filter(Internals.truthy)
				.join(' '),
		),
	);
};
