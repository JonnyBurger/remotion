import {Internals} from 'remotion';
import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import {AssetVolume} from './assets/types';

export const stringifyFfmpegFilter = ({
	streamIndex,
	trimLeft,
	trimRight,
	channels,
	startInVideo,
	simulatenousAssets,
	volume,
	fps,
	playbackRate,
}: {
	streamIndex: number;
	trimLeft: string;
	trimRight: string;
	channels: number;
	startInVideo: number;
	simulatenousAssets: number;
	volume: AssetVolume;
	fps: number;
	playbackRate: number;
}) => {
	const startInVideoSeconds = ((startInVideo / fps) * 1000).toFixed(); // in milliseconds

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		multiplier: simulatenousAssets,
		startInVideo,
		fps,
	});
	return (
		`[${streamIndex}:a]` +
		[
			// TODO: This will solve the issue of stitching videos together reported by Olli
			// on Discord. But will it introduce other problems where the audio is not right? Pending investigation
			'apad',
			`atrim=${trimLeft}:${trimRight}`,
			// For n channels, we delay n + 1 channels.
			// This is because `ffprobe` for some audio files reports the wrong amount
			// of channels.
			// This should be fine because FFMPEG documentation states:
			// "Unused delays will be silently ignored."
			// https://ffmpeg.org/ffmpeg-filters.html#adelay
			`adelay=${new Array(channels + 1).fill(startInVideoSeconds).join('|')}`,
			calculateATempo(playbackRate),
			`volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a${streamIndex}]`
	);
};
