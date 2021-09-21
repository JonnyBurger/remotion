// @ts-expect-error
import webpackDevMiddleware from '@jonny/webpack-dev-middleware';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import webpack from 'webpack';
// @ts-expect-error
import webpackHotMiddleware from 'webpack-hot-middleware';
import {getDesiredPort} from './get-port';
import {isUpdateAvailableWithTimeout} from './update-available';
import {webpackConfig} from './webpack-config';

const indexHtml = fs.readFileSync(
	path.join(__dirname, '..', 'web', 'index.html'),
	'utf-8'
);

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		inputProps?: object;
		envVariables?: Record<string, string>;
		port?: number;
		publicPath?: string;
		maxTimelineTracks?: number;
	}
): Promise<number> => {
	const app = express();
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const config = webpackConfig({
		entry,
		userDefinedComponent,
		outDir: tmpDir,
		environment: 'development',
		webpackOverride:
			options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
		inputProps: options?.inputProps ?? {},
		envVariables: options?.envVariables ?? {},
		maxTimelineTracks: options?.maxTimelineTracks ?? 15,
	});
	const compiler = webpack(config);

	app.use(webpackDevMiddleware(compiler));
	app.use(
		webpackHotMiddleware(compiler, {
			path: '/__webpack_hmr',
			heartbeat: 10 * 1000,
		})
	);

	app.get('/update', (req, res) => {
		isUpdateAvailableWithTimeout()
			.then((data) => {
				res.json(data);
			})
			.catch((err) => {
				res.status(500).json({
					err: err.message,
				});
			});
	});

	app.use('favicon.png', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'web', 'favicon.png'));
	});

	app.use('*', (req, res) => {
		res.type('text/html');
		res.end(indexHtml.replace(/%PUBLIC_PATH%/g, options?.publicPath ?? '/'));
	});

	const desiredPort = options?.port ?? Internals.getServerPort();

	const port = await getDesiredPort(desiredPort, 3000, 3100);

	app.listen(port);
	return port;
};
