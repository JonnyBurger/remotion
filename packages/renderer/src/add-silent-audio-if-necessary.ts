import execa from 'execa';
import {renameSync, unlinkSync} from 'fs';
import {getAudioChannels} from './assets/get-audio-channels';

export const addSilentAudioIfNecessary = async (
	videoFile: string
): Promise<void> => {
	const audioChannels = await getAudioChannels(videoFile);
	if (audioChannels > 0) {
		return;
	}

	const out = videoFile + '-n';

	await execa('ffmpeg', [
		'-f',
		'lavfi',
		'-i',
		'anullsrc',
		'-i',
		videoFile,
		'-map',
		'0:a:0',
		'-map',
		'1:v:0',
		'-c:a',
		'pcm_s16le',
		'-c:v',
		'copy',
		'-y',
		'-shortest',
		'-f',
		'matroska',
		out,
	]);
	unlinkSync(videoFile);
	renameSync(out, videoFile);
};
