import type {DownloadMap} from './assets/download-map';
import {createFfmpegMergeFilter} from './create-ffmpeg-merge-filter';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';

export const createFfmpegComplexFilter = async (
	filters: number,
	downloadMap: DownloadMap
): Promise<{
	complexFilterFlag: [string, string] | null;
	cleanup: () => void;
}> => {
	if (filters === 0) {
		return {complexFilterFlag: null, cleanup: () => undefined};
	}

	const complexFilter = createFfmpegMergeFilter(filters);

	const {file, cleanup} = await makeFfmpegFilterFile(
		complexFilter,
		downloadMap
	);

	return {
		complexFilterFlag: ['-filter_complex_script', file],
		cleanup,
	};
};
