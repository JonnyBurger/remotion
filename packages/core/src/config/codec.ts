const validCodecs = [
	'h264',
	'h265',
	'vp8',
	'vp9',
	'mp3',
	'aac',
	'wav',
	'prores',
	'h264-mkv',
] as const;

export type Codec = typeof validCodecs[number];
export type CodecOrUndefined = Codec | undefined;
const validLegacyFormats = ['mp4', 'png-sequence'] as const;
type LegacyFormat = typeof validLegacyFormats[number];

let codec: CodecOrUndefined;

export const getOutputCodecOrUndefined = (): CodecOrUndefined => {
	return codec;
};

export const DEFAULT_CODEC: Codec = 'h264';
const DEFAULT_LAMBDA_CODEC: Codec = 'h264-mkv';

// eslint-disable-next-line complexity
export const getFinalOutputCodec = ({
	codec: inputCodec,
	fileExtension,
	emitWarning,
	isLambda,
}: {
	codec: CodecOrUndefined;
	fileExtension: string | null;
	emitWarning: boolean;
	isLambda: boolean;
}): Codec => {
	if (inputCodec === undefined && fileExtension === 'webm') {
		if (emitWarning) {
			console.info(
				'You have specified a .webm extension, using the VP8 encoder. Use --codec=vp9 to use the Vp9 encoder.'
			);
		}

		return 'vp8';
	}

	if (inputCodec === undefined && fileExtension === 'hevc') {
		if (emitWarning) {
			console.info(
				'You have specified a .hevc extension, using the H265 encoder.'
			);
		}

		return 'h265';
	}

	if (inputCodec === undefined && fileExtension === 'mp3') {
		if (emitWarning) {
			console.info(
				'You have specified a .mp3 extension, using the MP3 encoder.'
			);
		}

		return 'mp3';
	}

	if (inputCodec === undefined && fileExtension === 'mov') {
		if (emitWarning) {
			console.info(
				'You have specified a .mov extension, using the Apple ProRes encoder.'
			);
		}

		return 'prores';
	}

	if (inputCodec === undefined && fileExtension === 'wav') {
		if (emitWarning) {
			console.info(
				'You have specified a .wav extension, using the WAV encoder.'
			);
		}

		return 'wav';
	}

	if (inputCodec === undefined && fileExtension === 'aac') {
		if (emitWarning) {
			console.info(
				'You have specified a .aac extension, using the AAC encoder.'
			);
		}

		return 'aac';
	}

	if (inputCodec === undefined && fileExtension === 'm4a') {
		if (emitWarning) {
			console.info(
				'You have specified a .m4a extension, using the AAC encoder.'
			);
		}

		return 'aac';
	}

	if (inputCodec === undefined && fileExtension === 'mkv') {
		if (emitWarning) {
			console.info(
				'You have specified a .mkv extension, using the H264 encoder and WAV audio format.'
			);
		}

		return 'h264-mkv';
	}

	return inputCodec ?? (isLambda ? DEFAULT_LAMBDA_CODEC : DEFAULT_CODEC);
};

export const setOutputFormat = (newLegacyFormat: LegacyFormat) => {
	if (newLegacyFormat === undefined) {
		codec = undefined;
		return;
	}

	if (!validLegacyFormats.includes(newLegacyFormat)) {
		throw new Error(
			`Output format must be one of the following: ${validLegacyFormats.join(
				', '
			)}, but got ${newLegacyFormat}`
		);
	}

	console.warn(
		'setOutputFormat() is deprecated. Use the setCodec() and setImageSequence() instead.'
	);
	if (newLegacyFormat === 'mp4') {
		codec = 'h264';
		return;
	}

	if (newLegacyFormat === 'png-sequence') {
		codec = undefined;
	}
};

export const setCodec = (newCodec: CodecOrUndefined) => {
	if (newCodec === undefined) {
		codec = undefined;
		return;
	}

	if (!validCodecs.includes(newCodec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', '
			)}, but got ${newCodec}`
		);
	}

	codec = newCodec;
};
