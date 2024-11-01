import type {webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import type {DevMiddlewareContext} from './types';

export function setupHooks(context: DevMiddlewareContext, logLevel: LogLevel) {
	function invalid() {
		// We are now in invalid state
		context.state = false;
		context.stats = undefined;
	}

	function done(stats: webpack.Stats | undefined) {
		context.state = true;
		context.stats = stats;

		// Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
		process.nextTick(() => {
			const {logger, state, callbacks} = context;

			// Check if still in valid state
			if (!state || !stats) {
				return;
			}

			logger.log('Compilation finished');

			const statsOptions: webpack.Configuration['stats'] = {
				preset: 'errors-warnings',
				colors: RenderInternals.isColorSupported(),
			};

			const printedStats = stats.toString(statsOptions);

			const lines = printedStats
				.split('\n')
				.map((a) => a.trimEnd())
				.filter(NoReactInternals.truthy)
				.map((a) => {
					if (a.startsWith('webpack compiled')) {
						return `Built in ${(stats.endTime as number) - (stats.startTime as number)}ms`;
					}

					return a;
				})
				.join('\n');

			if (lines) {
				RenderInternals.Log.info({indent: false, logLevel}, lines);
				if (process.argv.includes('--test-for-server-open')) {
					RenderInternals.Log.info(
						{indent: false, logLevel},
						'Yes, the server started.',
					);
					process.exit(0);
				}
			}

			context.callbacks = [];

			callbacks.forEach((callback) => {
				callback(stats);
			});
		});
	}

	context.compiler.hooks.watchRun.tap('remotion', invalid);
	context.compiler.hooks.invalid.tap('remotion', invalid);
	context.compiler.hooks.done.tap('remotion', done);
}
