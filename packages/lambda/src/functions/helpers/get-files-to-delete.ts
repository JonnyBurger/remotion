import {
	chunkKeyForIndex,
	encodingProgressKey,
	lambdaInitializedKey,
	lambdaTimingsPrefixForChunk,
} from '../../shared/constants';

export const getFilesToDelete = ({
	chunkCount,
	renderId,
}: {
	chunkCount: number;
	renderId: string;
}): {
	name: string;
	type: 'exact' | 'prefix';
}[] => {
	const initialized = new Array(chunkCount).fill(true).map((x, i) =>
		lambdaInitializedKey({
			chunk: i,
			renderId,
		})
	);
	const chunks = new Array(chunkCount).fill(true).map((x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
		})
	);
	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((x, i) => lambdaTimingsPrefixForChunk(renderId, i));
	return [
		...initialized.map((i) => {
			return {
				name: i,
				type: 'exact' as const,
			};
		}),
		...chunks.map((i) => {
			return {
				name: i,
				type: 'exact' as const,
			};
		}),
		...lambdaTimings.map((i) => {
			return {
				name: i,
				type: 'prefix' as const,
			};
		}),
		{
			name: encodingProgressKey(renderId),
			type: 'exact',
		},
	];
};
