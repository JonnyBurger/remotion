import {TCaption} from 'remotion';

interface CaptionFfmpegInputs {
	captionFilters: string[];
	captionInputs: [string, string][];
}

export const captionsToFfmpegInputs = ({
	assetsCount,
	captions,
}: {
	assetsCount: number;
	captions: TCaption[][];
}): CaptionFfmpegInputs => {
	const uniqueCaptions = Object.values(
		captions.flat(1).reduce<Record<string, TCaption>>((acc, caption) => {
			acc[caption.id] = caption;

			return acc;
		}, {})
	);

	/**
	 * TODO: Support more formats.
	 * `mov_text` works for SRT.
	 */
	const getFilter = ({language, title}: TCaption, index: number): string[] => {
		return ['-map', `${assetsCount + 1 + index}:s`, '-c:s', 'mov_text'].concat(
			language ? [`-metadata:s:s:${index}`, `language=${language}`] : '',
			title ? [`-metadata:s:s:${index}`, `title=${title}`] : ''
		);
	};

	return {
		captionInputs: uniqueCaptions.map((caption) => ['-i', caption.src]),
		captionFilters: uniqueCaptions.reduce<string[]>(
			(acc, caption, i) => acc.concat(getFilter(caption, i)),
			[]
		),
	};
};
