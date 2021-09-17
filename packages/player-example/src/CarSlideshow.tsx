import {lazy} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
	title: string;
	bgColor: string;
	color: string;
	loading: boolean;
};

const TriggerLoading = lazy(() => {
	return new Promise(() => () =>
		import('./trigger-loading').then(() => () => null as never)
	);
});

const CarSlideshow = ({title, bgColor, color, loading}: Props) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const left = interpolate(frame, [0, durationInFrames], [width, width * -1]);

	return (
		<div
			style={{
				backgroundColor: bgColor,
				width: width,
				height: height,
				position: 'absolute',
				left: 0,
				top: 0,
			}}
		>
			<h1
				style={{
					fontSize: '5em',
					fontWeight: 'bold',
					position: 'absolute',
					top: height / 2 - 100,
					left,
					color: color,
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</h1>
			{loading && <TriggerLoading />}
		</div>
	);
};

export default CarSlideshow;
