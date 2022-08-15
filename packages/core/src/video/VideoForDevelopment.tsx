import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {useFrameForVolumeProp} from '../audio/use-audio-frame';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state';
import type {RemotionVideoProps} from './props';

const VideoForDevelopmentRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps & {
		onlyWarnForMediaSeekingError: boolean;
	}
> = (props, ref) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	const volumePropFrame = useFrameForVolumeProp();

	const {
		volume,
		muted,
		playbackRate,
		onlyWarnForMediaSeekingError,
		...nativeProps
	} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	useMediaInTimeline({
		mediaRef: videoRef,
		volume,
		mediaVolume,
		mediaType: 'video',
		src: nativeProps.src,
	});

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		actualVolume,
		volume,
		mediaVolume,
		mediaRef: videoRef,
	});

	useMediaPlayback({
		mediaRef: videoRef,
		src: nativeProps.src,
		mediaType: 'video',
		playbackRate: props.playbackRate ?? 1,
		onlyWarnForMediaSeekingError,
	});

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	});

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		const errorHandler = () => {
			if (current?.error) {
				console.error('Error occurred in video', current?.error);
				throw new Error(
					`The browser threw an error while playing the video: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help`
				);
			} else {
				throw new Error('The browser threw an error');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});
		return () => {
			current.removeEventListener('error', errorHandler);
		};
	}, []);

	return (
		<video
			ref={videoRef}
			muted={muted || mediaMuted}
			playsInline
			{...nativeProps}
		/>
	);
};

export const VideoForDevelopment = forwardRef(
	VideoForDevelopmentRefForwardingFunction
);
