import type {
	AutomaticSpeechRecognitionOutput,
	AutomaticSpeechRecognitionPipeline,
} from '@xenova/transformers';
import { pipeline } from '@xenova/transformers';

export interface DeviceConfig {
	dtype: string | {[key: string]: string};
	device: string;
}

export interface MessageData {
  device: string;
  audio: Float32Array;
  language: string;
}

export interface ClientMessage {
	type: string;
	data: string | MessageData;
}

export interface WorkerResponse {
	status: string;
	data?:
		| string
		| {
				result:
					| AutomaticSpeechRecognitionOutput
					| AutomaticSpeechRecognitionOutput[];
				time: number;
		  };
}

const PER_DEVICE_CONFIG: {[key: string]: DeviceConfig} = {
	webgpu: {
		dtype: {
			encoder_model: 'fp32',
			decoder_model_merged: 'q4',
		},
		device: 'webgpu',
	},
	wasm: {
		dtype: 'q8',
		device: 'wasm',
	},
};

/**
 * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
 */
class PipelineSingeton {
	static model_id = 'onnx-community/whisper-base_timestamped';
	static instance: AutomaticSpeechRecognitionPipeline;

	static async getInstance(
		progress_callback: Function | undefined = undefined,
		device = 'webgpu',
	) {
		if (!this.instance) {
			this.instance = await pipeline(
				'automatic-speech-recognition',
				this.model_id,
				{
					...PER_DEVICE_CONFIG[device],
					progress_callback,
				},
			);
		}

		return this.instance;
	}
}

async function load({ device }: MessageData) {
	self.postMessage({
		status: 'loading',
		data: `Loading model (${device})...`,
	});

	// Load the pipeline and save it for future use.
	const transcriber = await PipelineSingeton.getInstance((x: MessageData) => {
		// We also add a progress callback to the pipeline so that we can
		// track model loading.
		self.postMessage(x);
	}, device);

	if (device === 'webgpu') {
		self.postMessage({
			status: 'loading',
			data: 'Compiling shaders and warming up model...',
		});
		await transcriber(new Float32Array(16_000), {
			language: 'en',
		});
	}

	self.postMessage({
		status: 'ready', 
		data: 'Model loaded successfully!'
	});
}

async function run({audio, language}: MessageData) {
	const transcriber = await PipelineSingeton.getInstance();

	const start = performance.now();

	const result = await transcriber(audio, {
		language,
		return_timestamps: 'word',
		chunk_length_s: 30,
	});

	const end = performance.now();

	self.postMessage({status: 'complete', data: {result, time: end - start}});
}


// Listen for messages from the main thread
self.addEventListener('message', async (e: any) => {
	const {type, data} = e.data as ClientMessage;

	switch (type) {
		case 'load':
			load(data as MessageData);
			break;

		case 'run':
			run(data as MessageData);
			break;

		default:
			self.postMessage({status: 'error', data: 'Unknown message type'});
	}
});
