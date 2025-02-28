import type {IsoBaseMediaBox} from './containers/iso-base-media/base-media-box';
import {
	getTfdtBox,
	getTfhdBox,
	getTrunBoxes,
} from './containers/iso-base-media/traversal';
import type {SamplePosition} from './get-sample-positions';
import type {AnySegment} from './parse-result';

const getSamplesFromTraf = (
	trafSegment: IsoBaseMediaBox,
	moofOffset: number,
): SamplePosition[] => {
	if (trafSegment.type !== 'regular-box' || trafSegment.boxType !== 'traf') {
		throw new Error('Expected traf-box');
	}

	const tfhdBox = getTfhdBox(trafSegment);
	const defaultSampleDuration = tfhdBox?.defaultSampleDuration ?? null;
	const defaultSampleSize = tfhdBox?.defaultSampleSize ?? null;
	const defaultSampleFlags = tfhdBox?.defaultSampleFlags ?? null;

	const tfdtBox = getTfdtBox(trafSegment);
	const trunBoxes = getTrunBoxes(trafSegment);

	let time = 0;
	let offset = 0;

	let dataOffset = 0;

	const samples: SamplePosition[] = [];

	for (const trunBox of trunBoxes) {
		let i = -1;

		if (trunBox.dataOffset) {
			dataOffset = trunBox.dataOffset;
			offset = 0;
		}

		for (const sample of trunBox.samples) {
			i++;
			const duration = sample.sampleDuration ?? defaultSampleDuration;
			if (duration === null) {
				throw new Error('Expected duration');
			}

			const size = sample.sampleSize ?? defaultSampleSize;
			if (size === null) {
				throw new Error('Expected size');
			}

			const isFirstSample = i === 0;
			const sampleFlags = sample.sampleFlags
				? sample.sampleFlags
				: isFirstSample && trunBox.firstSampleFlags !== null
					? trunBox.firstSampleFlags
					: defaultSampleFlags;
			if (sampleFlags === null) {
				throw new Error('Expected sample flags');
			}

			const keyframe = !((sampleFlags >> 16) & 0x1);

			const dts = time + (tfdtBox?.baseMediaDecodeTime ?? 0);

			const samplePosition: SamplePosition = {
				offset: offset + (moofOffset ?? 0) + (dataOffset ?? 0),
				dts,
				cts: dts + (sample.sampleCompositionTimeOffset ?? 0),
				duration,
				isKeyframe: keyframe,
				size,
				chunk: 0,
			};
			samples.push(samplePosition);
			offset += size;
			time += duration;
		}
	}

	return samples;
};

export const getSamplesFromMoof = ({
	moofBox,
	trackId,
}: {
	moofBox: AnySegment;
	trackId: number;
}) => {
	if (moofBox.type !== 'regular-box') {
		throw new Error('Expected moof-box');
	}

	const trafs = moofBox.children.filter(
		(c) => c.type === 'regular-box' && c.boxType === 'traf',
	) as IsoBaseMediaBox[];

	const mapped = trafs.map((traf) => {
		const tfhdBox = getTfhdBox(traf);

		return tfhdBox?.trackId === trackId
			? getSamplesFromTraf(traf, moofBox.offset)
			: [];
	});

	return mapped.flat(1);
};
