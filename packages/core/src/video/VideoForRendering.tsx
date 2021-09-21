import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import { useState } from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {CompositionManager} from '../CompositionManager';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {isRemoteAsset} from '../is-remote-asset';
import {random} from '../random';
import {continueRender, delayRender} from '../ready-manager';
import {SequenceContext} from '../sequencing';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getMediaTime} from './get-current-time';
import {RemotionVideoProps} from './props';

const VideoForRenderingForwardFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps
> = ({onError, volume: volumeProp, playbackRate, ...props}, ref) => {
	const absoluteFrame = useAbsoluteCurrentFrame();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const [videoElement, setVideoElement] = useState<HTMLVideoElement>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	const canvasPropsFromVideoProps = props as React.CanvasHTMLAttributes<HTMLCanvasElement>

	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(props.src ?? '')}-${sequenceContext?.cumulatedFrom}-${
				sequenceContext?.relativeFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[
			props.src,
			props.muted,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		]
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'video',
			src: getAbsoluteSrc(props.src),
			id,
			frame: absoluteFrame,
			volume,
			isRemote: isRemoteAsset(getAbsoluteSrc(props.src)),
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
		});

		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		id,
		unregisterAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
	]);

	useImperativeHandle(ref, () => {
		return videoElement as HTMLVideoElement;
	});

	useEffect(() => {
		if (!videoElement) {
			return;
		}

		const currentTime = (() => {
			return getMediaTime({
				fps: videoConfig.fps,
				frame,
				src: props.src as string,
				playbackRate: playbackRate || 1,
				startFrom: -mediaStartsAt,
			});
		})();
		const handle = delayRender();
		if (process.env.NODE_ENV === 'test') {
			continueRender(handle);
			return;
		}

		if (isApproximatelyTheSame(videoElement.currentTime, currentTime)) {
			if (videoElement.readyState >= 2) {
				continueRender(handle);
				return;
			}
			
			continueRender(handle);
			return;
		}

		videoElement.currentTime = currentTime;

		videoElement.addEventListener(
			'seeked',
			() => {
				// Improve me: This is ensures frame perfectness but slows down render.
				// Please see this issue for context: https://github.com/remotion-dev/remotion/issues/200
				drawVideoFrameOnCanvas()
				continueRender(handle);
			},
			{once: true}
		);
		videoElement.addEventListener(
			'ended',
			() => {
				continueRender(handle);
			},
			{once: true}
		);
		videoElement.addEventListener(
			'error',
			(err) => {
				console.error('Error occurred in video', err);
				continueRender(handle);
			},
			{once: true}
		);
	}, [volumePropsFrame, props.src, playbackRate, videoConfig.fps, frame, mediaStartsAt, videoElement]);

	useEffect(() => {
		if(!props.src) return
		const _videoElement = document.createElement(`video`)
		_videoElement.src = props.src
		_videoElement.crossOrigin = `anonymous`
		_videoElement.onerror = (event: Event | string) => {
			if(onError) onError(event as never)
		}

		// copying video element props
		Object.keys(props).forEach(propName => {
			const propValue = (props as any)[propName]
			const vid = _videoElement as any
			vid[propName] = propValue
		})

		const handle = delayRender();
		_videoElement.addEventListener(
			'loadeddata',
			() => {
				if(!canvasRef.current || (props.width !== undefined && props.height === undefined)) return continueRender(handle);
				const canvas = canvasRef.current
				canvas.width = _videoElement.videoWidth
				canvas.height = _videoElement.videoHeight
				videoRef.current = _videoElement || null
				setVideoElement(_videoElement)
				continueRender(handle);
			},
			{once: true}
		);
	}, [props.src]);

	const drawVideoFrameOnCanvas = () => {
		if(!videoRef.current) return
		if(!canvasRef.current) return
		const canvas = canvasRef.current
		const ctx = canvas.getContext("2d")
		if(!ctx) return
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
	}

	return <canvas ref={canvasRef} width={props.width} height={props.height} {...canvasPropsFromVideoProps} />;
};

export const VideoForRendering = forwardRef(VideoForRenderingForwardFunction);
