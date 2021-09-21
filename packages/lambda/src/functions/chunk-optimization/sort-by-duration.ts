import {getTimingEndTimestamps} from './get-profile-duration';
import {ChunkTimingData, TimingProfile} from './types';

const durationCache = new Map<ChunkTimingData, number>();

const getChunkDuration = (chunk: ChunkTimingData) => {
	const inCache = durationCache.get(chunk);
	if (inCache) {
		return inCache;
	}

	const timestamps = getTimingEndTimestamps(chunk);
	const duration = Math.max(...timestamps) - chunk.startDate;
	durationCache.set(chunk, duration);
	return duration;
};

export const sortProfileByDuration = (profile: TimingProfile) => {
	const sortedByDuration = profile.slice().sort((a, b) => {
		const aDuration = getChunkDuration(a);
		const bDuration = getChunkDuration(b);

		return aDuration - bDuration;
	});
	durationCache.clear();

	return sortedByDuration;
};
