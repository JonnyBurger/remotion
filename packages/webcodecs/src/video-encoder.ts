export type WebCodecsVideoEncoder = {
	encodeFrame: (videoFrame: VideoFrame) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	getQueueSize: () => number;
	flush: () => Promise<void>;
};

export const createVideoEncoder = ({
	onChunk,
	onError,
	signal,
	config,
}: {
	onChunk: (chunk: EncodedVideoChunk) => Promise<void>;
	onError: (error: DOMException) => void;
	signal: AbortSignal;
	config: VideoEncoderConfig;
}): WebCodecsVideoEncoder => {
	if (signal.aborted) {
		throw new Error('Not creating video encoder, already aborted');
	}

	let outputQueue = Promise.resolve();
	let outputQueueSize = 0;
	let dequeueResolver = () => {};

	const encoder = new VideoEncoder({
		error(error) {
			onError(error);
		},
		output(chunk) {
			outputQueueSize++;
			outputQueue = outputQueue
				.then(() => onChunk(chunk))
				.then(() => {
					outputQueueSize--;
					dequeueResolver();
					return Promise.resolve();
				});
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.close();
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	const getQueueSize = () => {
		return encoder.encodeQueueSize + outputQueueSize;
	};

	encoder.configure(config);

	let framesProcessed = 0;

	const waitForDequeue = async () => {
		await new Promise<void>((r) => {
			dequeueResolver = r;
			encoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	};

	const waitForFinish = async () => {
		while (getQueueSize() > 0) {
			await waitForDequeue();
		}
	};

	const encodeFrame = async (frame: VideoFrame) => {
		if (encoder.state === 'closed') {
			return;
		}

		while (getQueueSize() > 10) {
			await waitForDequeue();
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (encoder.state === 'closed') {
			return;
		}

		encoder.encode(frame, {
			keyFrame: framesProcessed % 40 === 0,
		});
		framesProcessed++;
	};

	let inputQueue = Promise.resolve();

	return {
		encodeFrame: (frame: VideoFrame) => {
			inputQueue = inputQueue.then(() => encodeFrame(frame));
			return inputQueue;
		},
		waitForFinish: async () => {
			await encoder.flush();
			await outputQueue;
			await waitForFinish();
		},
		close,
		getQueueSize,
		flush: async () => {
			await encoder.flush();
		},
	};
};
