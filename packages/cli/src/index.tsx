import {checkNodeVersion} from './check-version';
import {handleCommonError} from './handle-common-errors';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {previewCommand} from './preview';
import {printHelp} from './print-help';
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
		handleCommonError(err as Error);
		process.exit(1);
	}
};

export * from './render';
