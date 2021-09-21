import {initializeRenderCli} from './initialize-render-cli';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const lambdaCommand = async () => {
	try {
		const path = require.resolve('@remotion/lambda', {
			paths: [process.cwd()],
		});
		const {LambdaInternals} = require(path);
		initializeRenderCli('lambda');

		await LambdaInternals.executeCommand(parsedCli._.slice(1));
		process.exit(0);
	} catch (err) {
		Log.error(err);
		Log.error('Remotion Lambda is not installed.');
		Log.info('');
		Log.info('You can install it using:');
		Log.info('npm i @remotion/lambda');
		process.exit(1);
	}
};
