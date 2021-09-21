import {useRef} from 'react';
import {Caption, interpolate, useCurrentFrame, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const ref = useRef<HTMLVideoElement>(null);

	return (
		<>
			<Caption
				language="eng"
				src="http://127.0.0.1:8080/subs.srt"
				title="Some title"
			/>
			<Caption src="http://127.0.0.1:8080/subs_alt.srt" />
			<Video
				ref={ref}
				volume={interpolate(frame, [0, 500], [1, 0], {
					extrapolateRight: 'clamp',
				})}
				src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
			/>
		</>
	);
};

export default RemoteVideo;
