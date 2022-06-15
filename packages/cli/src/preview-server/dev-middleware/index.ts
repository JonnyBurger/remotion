import {webpack} from '@remotion/bundler';
import {MiddleWare, middleware} from './middleware';
import {setupHooks} from './setup-hooks';
import {setupOutputFileSystem} from './setup-output-filesystem';
import {DevMiddlewareContext} from './types';

export const wdm = (compiler: webpack.Compiler): MiddleWare => {
	const context: DevMiddlewareContext = {
		state: false,
		stats: undefined,
		callbacks: [],
		compiler,
		logger: compiler.getInfrastructureLogger('remotion'),
		outputFileSystem: undefined,
	};

	setupHooks(context);

	setupOutputFileSystem(context);

	const errorHandler = (error: Error | null | undefined) => {
		if (error) {
			context.logger.error(error);
		}
	};

	const watchOptions = context.compiler.options.watchOptions || {};

	context.compiler.watch(watchOptions, errorHandler);

	return middleware(context);
};
