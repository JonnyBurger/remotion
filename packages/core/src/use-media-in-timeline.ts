import {RefObject, useContext, useEffect, useMemo, useState} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame';
import {CompositionManager} from './CompositionManager';
import {getAssetFileName} from './get-asset-file-name';
import {useNonce} from './nonce';
import {SequenceContext} from './sequencing';
import {TimelineContext} from './timeline-position-state';
import {useVideoConfig} from './use-video-config';
import {evaluateVolume, VolumeProp} from './volume-prop';

export const useMediaInTimeline = ({
	volume,
	mediaVolume,
	mediaRef,
	src,
	mediaType,
}: {
	volume: VolumeProp | undefined;
	mediaVolume: number;
	mediaRef: RefObject<HTMLAudioElement | HTMLVideoElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
}) => {
	const videoConfig = useVideoConfig();
	const {rootId} = useContext(TimelineContext);
	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;
	const startsAt = useMediaStartsAt();
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);
	const [id] = useState(() => String(Math.random()));
	const nonce = useNonce();

	const duration = (() => {
		return parentSequence
			? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
			: videoConfig.durationInFrames;
	})();

	const doesVolumeChange = typeof volume === 'function';

	const volumes: string | number = useMemo(() => {
		if (typeof volume === 'number') {
			return volume;
		}

		return new Array(Math.max(0, duration + startsAt))
			.fill(true)
			.map((_, i) => {
				return evaluateVolume({
					frame: i + startsAt,
					volume,
					mediaVolume,
				});
			})
			.join(',');
	}, [duration, startsAt, volume, mediaVolume]);

	useEffect(() => {
		if (!mediaRef.current) {
			return;
		}

		if (!src) {
			throw new Error('No src passed');
		}

		registerSequence({
			type: mediaType,
			src,
			id,
			// TODO: Cap to media duration
			duration,
			from: 0,
			parent: parentSequence?.id ?? null,
			displayName: getAssetFileName(src),
			rootId,
			volume: volumes,
			showInTimeline: true,
			nonce,
			startMediaFrom: 0 - startsAt,
			doesVolumeChange,
		});
		return () => unregisterSequence(id);
	}, [
		actualFrom,
		duration,
		id,
		parentSequence,
		src,
		registerSequence,
		rootId,
		unregisterSequence,
		videoConfig,
		volumes,
		doesVolumeChange,
		nonce,
		mediaRef,
		mediaType,
		startsAt,
	]);
};
