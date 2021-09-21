import {_Object} from '@aws-sdk/client-s3';
import {Codec} from 'remotion';
import {outName, outStillName, RenderMetadata} from '../../shared/constants';
import {getCurrentRegionInFunction} from './get-current-region';

export const findOutputFileInBucket = ({
	contents,
	renderMetadata,
	bucketName,
	renderId,
	type,
}: {
	contents: _Object[];
	renderMetadata: RenderMetadata | null;
	bucketName: string;
	renderId: string;
	type: 'still' | 'video';
}): {
	url: string;
	size: number;
	lastModified: number;
} | null => {
	const expectedOutName = (() => {
		if (!renderMetadata) {
			return null;
		}

		if (type === 'still') {
			return outStillName(renderId, renderMetadata?.imageFormat);
		}

		if (type === 'video') {
			return outName(renderId, renderMetadata?.codec as Codec);
		}

		throw new TypeError('no type passed');
	})();

	const output = expectedOutName
		? renderMetadata
			? contents.find((c) => c.Key?.includes(expectedOutName)) ?? null
			: null
		: null;

	if (!output) {
		return null;
	}

	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	return {
		lastModified: output.LastModified?.getTime() as number,
		size: output.Size as number,
		url: `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${bucketName}/${expectedOutName}`,
	};
};
