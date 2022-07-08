import {existsSync} from 'fs';
import path from 'path';
import type {FfmpegExecutable} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';
import {waitForSymbolicationToBeDone} from './wait-for-symbolication-error-to-be-done';

export const prepareServer = async ({
	downloadDir,
	ffmpegExecutable,
	ffprobeExecutable,
	onDownload,
	onError,
	webpackConfigOrServeUrl,
	port,
}: {
	webpackConfigOrServeUrl: string;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	port: number | null;
}): Promise<{
	serveUrl: string;
	closeServer: () => Promise<unknown>;
	offthreadPort: number;
}> => {
	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {port: offthreadPort, close: closeProxy} = await serveStatic(null, {
			downloadDir,
			onDownload,
			onError,
			ffmpegExecutable,
			ffprobeExecutable,
			port,
		});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => {
				return closeProxy();
			},
			offthreadPort,
		});
	}

	// Check if the path has a `index.html` file
	const indexFile = path.join(webpackConfigOrServeUrl, 'index.html');
	const exists = existsSync(indexFile);
	if (!exists) {
		throw new Error(
			`Tried to serve the Webpack bundle on a HTTP server, but the file ${indexFile} does not exist. Is this a valid path to a Webpack bundle?`
		);
	}

	const {port: serverPort, close} = await serveStatic(webpackConfigOrServeUrl, {
		downloadDir,
		onDownload,
		onError,
		ffmpegExecutable,
		ffprobeExecutable,
		port,
	});
	return Promise.resolve({
		closeServer: () => {
			return waitForSymbolicationToBeDone().then(() => close());
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
	});
};
