import type {
	AllOptions,
	Options,
	ParseMedia,
	ParseMediaFields,
	ParseMediaOptions,
	ParseMediaResult,
} from './options';
import {deserializeError} from './worker/serialize-error';
import type {WorkerPayload} from './worker/worker-types';

const post = (worker: Worker, payload: WorkerPayload) => {
	worker.postMessage(payload);
};

export const parseMediaOnWorker: ParseMedia = async <
	F extends Options<ParseMediaFields>,
>({
	controller,
	...params
}: ParseMediaOptions<F>) => {
	if (typeof Worker === 'undefined') {
		throw new Error('"Worker" is not available. Cannot call workerClient()');
	}

	const worker = new Worker(new URL('./worker-server', import.meta.url));

	post(worker, {
		type: 'request-worker',
		payload: params,
	});

	const {promise, resolve, reject} =
		Promise.withResolvers<
			ParseMediaResult<Partial<AllOptions<ParseMediaFields>>>
		>();

	const onAbort = () => {
		post(worker, {type: 'request-abort'});
	};

	const onResume = () => {
		post(worker, {type: 'request-resume'});
	};

	const onPause = () => {
		post(worker, {type: 'request-pause'});
	};

	function onMessage(message: MessageEvent) {
		const data = message.data as WorkerPayload;
		if (data.type === 'response-done') {
			resolve(data.payload);
		}

		if (data.type === 'response-error') {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			cleanup();
			reject(deserializeError(data));
		}
	}

	worker.addEventListener('message', onMessage);
	controller?.addEventListener('abort', onAbort);
	controller?.addEventListener('resume', onResume);
	controller?.addEventListener('pause', onPause);

	function cleanup() {
		worker.removeEventListener('message', onMessage);
		controller?.removeEventListener('abort', onAbort);
		controller?.removeEventListener('resume', onResume);
		controller?.removeEventListener('pause', onPause);

		worker.terminate();
	}

	const val = await promise;

	cleanup();
	return val as Promise<ParseMediaResult<F>>;
};
