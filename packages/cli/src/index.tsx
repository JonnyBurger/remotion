import chalk from 'chalk';
import xns from 'xns';
import {checkNodeVersion} from './check-version';
import {getCliOptions} from './get-cli-options';
import {loadConfig} from './get-config-file-name';
import {initializeRenderCli} from './initialize-render-cli';
import {lambdaCommand} from './lambda-command';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parseCommandLine, parsedCli} from './parse-command-line';
import {previewCommand} from './preview';
import {printHelp} from './print-help';
import {createOverwriteableCliOutput, makeProgressBar} from './progress-bar';
import {render} from './render';
import {still} from './still';
import {upgrade} from './upgrade';

export const cli = async () => {
	const args = process.argv;
	const command = args[2];

	if (parsedCli.help) {
		printHelp();
		process.exit(0);
	}

	// To check node version and to warn if node version is <12.10.0
	checkNodeVersion();
	try {
		if (command === 'preview') {
			await previewCommand();
		} else if (command === 'lambda') {
			await lambdaCommand();
		} else if (command === 'render') {
			await render();
		} else if (command === 'still') {
			await still();
		} else if (command === 'upgrade') {
			await upgrade();
		} else if (command === 'help') {
			printHelp();
			process.exit(0);
		} else {
			Log.error(`Command ${command} not found.`);
			printHelp();
			process.exit(1);
		}
	} catch (err) {
		Log.error((err as Error).stack);
		process.exit(1);
	}
};

export * from './render';

export const CliInternals = {
	createOverwriteableCliOutput,
	chalk,
	xns,
	makeProgressBar,
	Log,
	loadConfigFile,
	getCliOptions,
	parseCommandLine,
	loadConfig,
	initializeRenderCli,
};
