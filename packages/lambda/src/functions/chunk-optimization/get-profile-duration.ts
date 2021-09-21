import {ChunkTimingData, TimingProfile} from './types';

export const getTimingEndTimestamps = (chunk: ChunkTimingData): number[] => {
	return chunk.timings.map((timing) => chunk.startDate + timing);
};

const getProfileTimestamps = (chunks: TimingProfile) => {
	return chunks.map((c) => getTimingEndTimestamps(c));
};

export const getProfileDuration = (chunks: TimingProfile) => {
	const startTimeStamps = chunks.map((c) => c.startDate).flat(1);
	const endTimestamps = getProfileTimestamps(chunks).flat(1);

	const earliest = Math.min(...startTimeStamps);
	const latest = Math.max(...endTimestamps);

	return latest - earliest;
};
