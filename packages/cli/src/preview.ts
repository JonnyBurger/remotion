// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import {BundlerInternals} from '@remotion/bundler';
import betterOpn from 'better-opn';
import path from 'path';
import {Internals} from 'remotion';
import xns from 'xns';
import {loadConfig} from './get-config-file-name';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

const noop = () => undefined;

export const previewCommand = xns(async () => {
	const file = parsedCli._[1];
	const {port: desiredPort} = parsedCli;
	const fullPath = path.join(process.cwd(), file);

	const appliedName = await loadConfig();
	if (appliedName) {
		Log.verbose(`Applied configuration from ${appliedName}.`);
	} else {
		Log.verbose('No config file loaded.');
	}

	const inputProps = getInputProps();
	const envVariables = await getEnvironmentVariables();

	const port = await BundlerInternals.startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			inputProps,
			envVariables,
			port: desiredPort,
			maxTimelineTracks: Internals.getMaxTimelineTracks(),
		}
	);
	betterOpn(`http://localhost:${port}`);
	await new Promise(noop);
});
