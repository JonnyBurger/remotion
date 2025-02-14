/**
 * Decode audio data from a file, blob, or array buffer
 * @param data - File | Blob | ArrayBuffer
 * @returns raw audio data
 * @throws Error if decoding fails
 */
export const decodeAudioData = async (data: File | Blob | ArrayBuffer) => {
	const audioContext = new window.AudioContext({
		sampleRate: 16_000,
	});

	try {
		if (data instanceof Blob || data instanceof File) {
			data = await data.arrayBuffer();
		}

		const audioBuffer = await audioContext.decodeAudioData(data);
		let audio: Float32Array;
		if (audioBuffer.numberOfChannels === 2) {
			// Merge channels
			const SCALING_FACTOR = Math.sqrt(2);
			const left = audioBuffer.getChannelData(0);
			const right = audioBuffer.getChannelData(1);
			audio = new Float32Array(left.length);
			for (let i = 0; i < audioBuffer.length; ++i) {
				audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
			}
		} else {
			audio = audioBuffer.getChannelData(0);
		}

		return audio;
	} catch (e) {
		throw new Error(`Failed to decode audio: ${e}`);
	}
};
