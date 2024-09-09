import type {AudioSample} from '@remotion/media-parser';

export type WebCodecsAudioDecoder = {
	processSample: (audioSample: AudioSample) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	getQueueSize: () => number;
	flush: () => Promise<void>;
};

export const createAudioDecoder = ({
	onFrame,
	onError,
	signal,
	config,
}: {
	onFrame: (frame: AudioData) => Promise<void>;
	onError: (error: DOMException) => void;
	signal: AbortSignal;
	config: AudioDecoderConfig;
}): WebCodecsAudioDecoder => {
	if (signal.aborted) {
		throw new Error('Not creating audio decoder, already aborted');
	}

	let outputQueue = Promise.resolve();
	let outputQueueSize = 0;
	let dequeueResolver = () => {};

	const audioDecoder = new AudioDecoder({
		output(inputFrame) {
			outputQueueSize++;
			outputQueue = outputQueue
				.then(() => onFrame(inputFrame))
				.then(() => {
					dequeueResolver();
					outputQueueSize--;
					return Promise.resolve();
				});
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		signal.removeEventListener('abort', onAbort);

		if (audioDecoder.state === 'closed') {
			return;
		}

		audioDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	signal.addEventListener('abort', onAbort);

	const getQueueSize = () => {
		return audioDecoder.decodeQueueSize + outputQueueSize;
	};

	audioDecoder.configure(config);

	const waitForDequeue = async () => {
		await new Promise<void>((r) => {
			dequeueResolver = r;
			// @ts-expect-error exists
			audioDecoder.addEventListener('dequeue', () => r(), {
				once: true,
			});
		});
	};

	const waitForFinish = async () => {
		while (getQueueSize() > 0) {
			await waitForDequeue();
		}
	};

	const processSample = async (audioSample: AudioSample) => {
		if (audioDecoder.state === 'closed') {
			return;
		}

		while (getQueueSize() > 10) {
			await waitForDequeue();
		}

		// Don't flush, it messes up the audio

		const chunk = new EncodedAudioChunk(audioSample);
		audioDecoder.decode(chunk);
	};

	let queue = Promise.resolve();

	return {
		processSample: (sample: AudioSample) => {
			queue = queue.then(() => processSample(sample));
			return queue;
		},
		waitForFinish: async () => {
			await audioDecoder.flush();
			await waitForFinish();
			await outputQueue;
		},
		close,
		getQueueSize,
		flush: async () => {
			await audioDecoder.flush();
		},
	};
};
