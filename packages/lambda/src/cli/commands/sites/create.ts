import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';

import type {ProviderSpecifics} from '@remotion/serverless';
import {
	internalGetOrCreateBucket,
	type Privacy,
} from '@remotion/serverless/client';
import {NoReactInternals} from 'remotion/no-react';
import type {AwsProvider} from '../../../functions/aws-implementation';
import {LambdaInternals} from '../../../internals';
import {BINARY_NAME} from '../../../shared/constants';
import {validateSiteName} from '../../../shared/validate-site-name';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import type {
	BucketCreationProgress,
	BundleProgress,
	DeployToS3Progress,
	DiffingProgress,
} from '../../helpers/progress-bar';
import {
	makeBucketProgress,
	makeBundleProgress,
	makeDeployProgressBar,
	makeDiffingProgressBar,
} from '../../helpers/progress-bar';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';

export const SITES_CREATE_SUBCOMMAND = 'create';

const {
	folderExpiryOption,
	publicDirOption,
	throwIfSiteExistsOption,
	disableGitSourceOption,
} = BrowserSafeApis.options;

export const sitesCreateSubcommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
	implementation: ProviderSpecifics<AwsProvider>,
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

	const desiredSiteName = parsedLambdaCli['site-name'] ?? undefined;
	if (desiredSiteName !== undefined) {
		validateSiteName(desiredSiteName);
	}

	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		// No browser logs
		updatesDontOverwrite: false,
		indent: false,
	});

	const multiProgress: {
		bundleProgress: BundleProgress;
		bucketProgress: BucketCreationProgress;
		deployProgress: DeployToS3Progress;
		diffingProgress: DiffingProgress;
	} = {
		bundleProgress: {
			doneIn: null,
			progress: 0,
		},
		bucketProgress: {
			doneIn: null,
		},
		deployProgress: {
			doneIn: null,
			totalSize: null,
			sizeUploaded: 0,
			stats: null,
		},
		diffingProgress: {
			doneIn: null,
			bytesProcessed: 0,
		},
	};

	const updateProgress = (newLine: boolean) => {
		progressBar.update(
			[
				makeBundleProgress(multiProgress.bundleProgress),
				makeBucketProgress(multiProgress.bucketProgress),
				makeDiffingProgressBar(multiProgress.diffingProgress),
				makeDeployProgressBar(multiProgress.deployProgress),
			]
				.filter(NoReactInternals.truthy)
				.join('\n'),
			newLine,
		);
	};

	const bucketStart = Date.now();

	const enableFolderExpiry = folderExpiryOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const cliBucketName = parsedLambdaCli['force-bucket-name'] ?? null;
	const bucketName =
		cliBucketName ??
		(
			await internalGetOrCreateBucket({
				region: getAwsRegion(),
				enableFolderExpiry,
				customCredentials: null,
				providerSpecifics: implementation,
				forcePathStyle: false,
			})
		).bucketName;

	multiProgress.bucketProgress.doneIn = Date.now() - bucketStart;
	updateProgress(false);

	const bundleStart = Date.now();
	let uploadStart = Date.now();

	const publicDir = publicDirOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;

	const throwIfSiteExists = throwIfSiteExistsOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;
	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: CliInternals.parsedCli,
	}).value;

	const gitSource = CliInternals.getGitSource({remotionRoot, disableGitSource});

	const {serveUrl, siteName, stats} = await LambdaInternals.internalDeploySite({
		entryPoint: file,
		siteName: desiredSiteName ?? implementation.randomHash(),
		bucketName,
		options: {
			publicDir,
			rootDir: remotionRoot,
			onBundleProgress: (progress: number) => {
				multiProgress.bundleProgress = {
					progress,
					doneIn: progress === 100 ? Date.now() - bundleStart : null,
				};
				if (progress === 100) {
					uploadStart = Date.now();
				}

				updateProgress(false);
			},
			onDiffingProgress(bytes, done) {
				const previous = multiProgress.diffingProgress.bytesProcessed;

				const newBytes = bytes - previous;
				if (newBytes > 100_000_000 || done) {
					multiProgress.diffingProgress = {
						bytesProcessed: bytes,
						doneIn: done ? Date.now() - bundleStart : null,
					};
					updateProgress(false);
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
			bypassBucketNameValidation: Boolean(parsedLambdaCli['force-bucket-name']),
		},
		region: getAwsRegion(),
		privacy:
			(parsedLambdaCli.privacy as Exclude<Privacy, 'private'>) ?? 'public',
		gitSource,
		indent: false,
		logLevel,
		throwIfSiteExists,
		providerSpecifics: implementation,
		forcePathStyle: parsedLambdaCli['force-path-style'] ?? false,
	});

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

	CliInternals.printFact('info')({
		indent: false,
		left: 'Serve URL',
		logLevel,
		right: serveUrl,
		color: 'blueBright',
	});
	CliInternals.printFact('info')({
		indent: false,
		left: 'Site name',
		logLevel,
		right: siteName,
		color: 'blueBright',
	});

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
			['npx remotion lambda sites create', args[0], `--site-name=${siteName}`]
				.filter(NoReactInternals.truthy)
				.join(' '),
		),
	);
};
