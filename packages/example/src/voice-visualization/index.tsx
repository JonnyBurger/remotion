import {useAudioData} from '@remotion/media-utils';
import React from 'react';
import {Audio, staticFile} from 'remotion';
import {VoiceVis} from './VoiceVisualization';

const padding = 80;

export const VoiceVisualization: React.FC = () => {
	const audioDataVoice = useAudioData(staticFile('podcast.wav'));

	if (!audioDataVoice) {
		return null;
	}

	return (
		<div
			style={{flex: 1, padding}}
			className="flex-1 bg-white items-center justify-center flex flex-col"
		>
			<Audio src={staticFile('podcast.wav')} />
			<VoiceVis
				padding={padding}
				audioDataVoice={audioDataVoice}
				numberOfSamples={10}
				windowInSeconds={0.1}
				posterization={3}
				amplitude={4}
			/>
			<VoiceVis
				padding={padding}
				audioDataVoice={audioDataVoice}
				numberOfSamples={40}
				windowInSeconds={0.1}
				posterization={3}
				amplitude={3}
			/>
			<VoiceVis
				padding={padding}
				audioDataVoice={audioDataVoice}
				numberOfSamples={64}
				windowInSeconds={0.1}
				posterization={3}
				amplitude={3}
			/>
			<VoiceVis
				padding={padding}
				audioDataVoice={audioDataVoice}
				numberOfSamples={200}
				windowInSeconds={0.1}
				posterization={3}
				amplitude={3}
			/>
		</div>
	);
};
