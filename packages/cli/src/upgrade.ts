import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {Internals} from 'remotion';
import {getLatestRemotionVersion} from './get-latest-remotion-version';
import {Log} from './log';
import {
	getPackageManager,
	lockFilePaths,
	PackageManager,
} from './preview-server/get-package-manager';

const getUpgradeCommand = ({
	manager,
	packages,
	version,
}: {
	manager: PackageManager;
	packages: string[];
	version: string;
}): string[] => {
	const pkgList = packages.map((p) => `${p}@^${version}`);

	const commands: {[key in PackageManager]: string[]} = {
		npm: ['i', ...pkgList],
		pnpm: ['i', ...pkgList],
		yarn: ['add', ...pkgList],
	};

	return commands[manager];
};

export const upgrade = async () => {
	const packageJsonFilePath = path.join(process.cwd(), 'package.json');
	if (!fs.existsSync(packageJsonFilePath)) {
		Log.error(
			'Could not upgrade because no package.json could be found in your project.'
		);
		process.exit(1);
	}

	const packageJson = require(packageJsonFilePath);
	const dependencies = Object.keys(packageJson.dependencies);
	const latestRemotionVersion = await getLatestRemotionVersion();

	const manager = getPackageManager();

	if (manager === 'unknown') {
		throw new Error(
			`No lockfile was found in your project (one of ${lockFilePaths
				.map((p) => p.path)
				.join(', ')}). Install dependencies using your favorite manager!`
		);
	}

	const toUpgrade = [
		'@remotion/bundler',
		'@remotion/cli',
		'@remotion/eslint-config',
		'@remotion/renderer',
		'@remotion/media-utils',
		'@remotion/babel-loader',
		'@remotion/lambda',
		'@remotion/preload',
		'@remotion/three',
		'@remotion/gif',
		'remotion',
	].filter((u) => dependencies.includes(u));

	const prom = RenderInternals.execa(
		manager.manager,
		getUpgradeCommand({
			manager: manager.manager,
			packages: toUpgrade,
			version: latestRemotionVersion,
		}),
		{
			stdio: 'inherit',
		}
	);
	if (
		Internals.Logging.isEqualOrBelowLogLevel(
			Internals.Logging.getLogLevel(),
			'info'
		)
	) {
		prom.stdout?.pipe(process.stdout);
	}

	await prom;
	Log.info('⏫ Remotion has been upgraded!');
};
