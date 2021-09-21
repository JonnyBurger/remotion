import {EncodingProgress, RenderMetadata} from '../../shared/constants';

export const getFinalEncodingStatus = ({
	encodingStatus: encodingProgress,
	renderMetadata,
	outputFileExists,
}: {
	encodingStatus: EncodingProgress | null;
	renderMetadata: RenderMetadata | null;
	outputFileExists: boolean;
}): EncodingProgress | null => {
	if (!renderMetadata) {
		return null;
	}

	if (outputFileExists) {
		return {
			framesEncoded: renderMetadata.videoConfig.durationInFrames,
		};
	}

	return encodingProgress;
};
