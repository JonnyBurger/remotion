import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';

export const initializeRenderCli = (
	type: 'still' | 'sequence' | 'lambda' | 'preview'
) => {
	const appliedName = loadConfig();
	if (appliedName) {
		Log.verbose(`Applied configuration from ${appliedName}.`);
	} else {
		Log.verbose('No config file loaded.');
	}

	parseCommandLine(type);
};
