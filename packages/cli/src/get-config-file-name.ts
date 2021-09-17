import {existsSync} from 'fs';
import path from 'path';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
export const defaultConfigFileJavascript = 'remotion.config.js';
export const defaultConfigFileTypescript = 'remotion.config.ts';

export const loadConfig = (): Promise<string | null> => {
	if (parsedCli.config) {
		const fullPath = path.resolve(process.cwd(), parsedCli.config);
		if (!existsSync(fullPath)) {
			Log.error(
				`You specified a config file location of "${parsedCli.config}" but no file under ${fullPath} was found.`
			);
			process.exit(1);
		}

		return loadConfigFile(parsedCli.config, fullPath.endsWith('.js'));
	}

	if (existsSync(path.resolve(process.cwd(), defaultConfigFileTypescript))) {
		return loadConfigFile(defaultConfigFileTypescript, false);
	}

	if (existsSync(path.resolve(process.cwd(), defaultConfigFileJavascript))) {
		return loadConfigFile(defaultConfigFileJavascript, true);
	}

	return Promise.resolve(null);
};
