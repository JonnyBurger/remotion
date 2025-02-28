import type {BufferIterator} from '../../buffer-iterator';

export interface TrunBox {
	type: 'trun-box';
	version: number;
	sampleCount: number;
	dataOffset: number | null;
	firstSampleFlags: number | null;
	samples: TRunSample[];
}

type TRunSample = {
	sampleDuration: number | null;
	sampleSize: number | null;
	sampleFlags: number | null;
	sampleCompositionTimeOffset: number | null;
};

export const parseTrun = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): TrunBox => {
	const version = iterator.getUint8();
	if (version !== 0 && version !== 1) {
		throw new Error(`Unsupported TRUN version ${version}`);
	}

	const flags = iterator.getUint24();
	const sampleCount = iterator.getUint32();

	const dataOffset = flags & 0x01 ? iterator.getInt32() : null;
	const firstSampleFlags = flags & 0x04 ? iterator.getUint32() : null;

	const samples: TRunSample[] = [];

	for (let i = 0; i < sampleCount; i++) {
		const sampleDuration = flags & 0x100 ? iterator.getUint32() : null;
		const sampleSize = flags & 0x200 ? iterator.getUint32() : null;
		const sampleFlags = flags & 0x400 ? iterator.getUint32() : null;
		const sampleCompositionTimeOffset =
			flags & 0x800
				? version === 0
					? iterator.getUint32()
					: iterator.getInt32()
				: null;

		samples.push({
			sampleDuration,
			sampleSize,
			sampleFlags,
			sampleCompositionTimeOffset,
		});
	}

	const currentOffset = iterator.counter.getOffset();
	const left = size - (currentOffset - offset);
	if (left !== 0) {
		throw new Error(`Unexpected data left in TRUN box: ${left}`);
	}

	return {
		type: 'trun-box',
		version,
		sampleCount,
		dataOffset,
		firstSampleFlags,
		samples,
	};
};
