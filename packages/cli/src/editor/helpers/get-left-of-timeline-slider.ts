import {PlayerInternals} from '@remotion/player';
import {useCallback, useMemo} from 'react';
import {Internals} from 'remotion';
import {sliderAreaRef} from '../components/Timeline/timeline-refs';
import {TIMELINE_PADDING} from './timeline-layout';

export const useGetXPositionOfItemInTimeline = () => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});

	const videoConfig = Internals.useUnsafeVideoConfig();

	const width = size?.width ?? 0;

	const get = useCallback(
		(frame: number) => {
			if (!videoConfig) {
				return 0;
			}

			return getXPositionOfItemInTimelineImperatively(
				frame,
				videoConfig.durationInFrames,
				width
			);
		},
		[videoConfig, width]
	);

	return useMemo(() => {
		return {get, width};
	}, [get, width]);
};

export const getXPositionOfItemInTimelineImperatively = (
	frame: number,
	duration: number,
	width: number
) => {
	const proportion = frame / (duration - 1);

	return proportion * (width - TIMELINE_PADDING * 2) + TIMELINE_PADDING;
};
