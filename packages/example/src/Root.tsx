import {alias} from 'lib/alias';
import React, {useCallback, useMemo} from 'react';
import {
	CalculateMetadataFunction,
	Composition,
	Folder,
	Still,
	getInputProps,
	staticFile,
} from 'remotion';
import {z} from 'zod';
import {TwentyTwoKHzAudio} from './22KhzAudio';
import {UseanimatedEmojis} from './AnimatedEmojis';
import BetaText, {betaTextSchema} from './BetaText';
import {NativeBufferStateForImage} from './BufferState/Image';
import {NativeBufferState} from './BufferState/Simple';
import {NativeBufferStateForVideo} from './BufferState/Video';
import {CancelRender} from './CancelRender';
import {ClassSerialization} from './ClassSerialization';
import {ColorInterpolation} from './ColorInterpolation';
import {ComplexSounds} from './ComplexSounds';
import {MyCtx, WrappedInContext} from './Context';
import CorruptVideo from './CorruptVideo';
import {DecoderDemo} from './DecoderDemo';
import {DynamicDuration, dynamicDurationSchema} from './DynamicDuration';
import {EmojiTestbed} from './Emoji';
import {ErrorOnFrame10} from './ErrorOnFrame10';
import {Expert} from './Expert';
import {FontDemo} from './Fonts';
import {Framer} from './Framer';
import {FreezeExample} from './Freeze/FreezeExample';
import {Green} from './Green';
import {HlsDemo} from './Hls/HlsDemo';
import {HugePayload, hugePayloadSchema} from './HugePayload';
import {Layers} from './Layers';
import {ManyAudio} from './ManyAudio';
import {HandleAudioRenderError} from './MediaErrorHandling/HandleAudioRenderError';
import {MissingImg} from './MissingImg';
import {
	OffthreadRemoteVideo,
	calculateMetadataFn,
} from './OffthreadRemoteVideo/OffthreadRemoteVideo';
import {OffthreadVideoToCanvas} from './OffthreadVideoToCanvas';
import {OrbScene} from './Orb';
import {ShapesMorph} from './Paths/ShapesMorph';
import {SlicePath} from './Paths/SlicePath';
import {PremountedExample} from './Premount';
import {PremountedRemoteVideos} from './Premount/RemoteVideos';
import InfinityVideo from './ReallyLongVideo';
import RemoteVideo from './RemoteVideo';
import {RetryDelayRender} from './RetryDelayRender';
import RiveVehicle from './Rive/RiveExample';
import {ScalePath} from './ScalePath';
import {
	ArrayTest,
	SchemaTest,
	schemaArrayTestSchema,
	schemaTestSchema,
} from './SchemaTest';
import {Scripts} from './Scripts';
import {WidthHeightSequences} from './Sequence/WidthHeightSequences';
import CircleTest from './Shapes/CircleTest';
import EllipseTest from './Shapes/EllipseTest';
import RectTest from './Shapes/RectTest';
import StarTest from './Shapes/StarTest';
import TriangleTest from './Shapes/TriangleTest';
import {RuntimeShaderZoomBlur} from './Skia/Blur';
import {RuntimeShaderDemo} from './Skia/Shader';
import {SkipZeroFrame} from './SkipZeroFrame';
import {BaseSpring, SpringWithDuration} from './Spring/base-spring';
import {SeriesTesting} from './StaggerTesting';
import {StaticDemo} from './StaticServer';
import {StillHelloWorld} from './StillHelloWorld';
import {StillZoom} from './StillZoom';
import {DeleteStaticFile} from './StudioApis/DeleteStaticFile';
import {ClickUpdate} from './StudioApis/RestartStudio';
import {
	SaveDefaultProps,
	saveStudioSchema,
} from './StudioApis/SaveDefaultProps';
import {TriggerCalculateMetadata} from './StudioApis/TriggerCalculateMetadata';
import {WriteStaticFile} from './StudioApis/WriteStaticFile';
import {SubtitleArtifact} from './SubtitleArtifact/SubtitleArtifact';
import {Tailwind} from './Tailwind';
import {TenFrameTester} from './TenFrameTester';
import {TextStroke} from './TextStroke';
import ThreeBasic from './ThreeBasic';
import {ThreeHtml} from './ThreeHtml/ThreeHtml';
import {VideoTextureDemo} from './ThreeScene/Scene';
import {Timeout} from './Timeout';
import {FitText, fitTextSchema} from './Title/FitText';
import {AudioTransition} from './Transitions/AudioTransition';
import {BasicTransition} from './Transitions/BasicTransition';
import {CustomTransition} from './Transitions/CustomTransition';
import {VideoOnCanvas} from './VideoOnCanvas';
import {Greenscreen} from './VideoOnCanvas/greenscreen';
import {VideoParser} from './VideoParser';
import {VideoSpeed} from './VideoSpeed';
import {VideoTesting} from './VideoTesting';
import {WarpDemoOuter} from './WarpText';
import {WarpDemo2} from './WarpText/demo2';
import './style.css';
import {WatchStaticDemo} from './watch-static';

if (alias !== 'alias') {
	throw new Error('should support TS aliases');
}

const INCLUDE_COMP_BREAKING_GET_COMPOSITIONS = false;

import GoogleFontsPicker, {googleFontsPickerSchema} from './GoogleFontsPicker';
import styles from './styles.module.scss';

class Vector2 {
	readonly x: number;
	readonly y: number;

	constructor(x: number, y: number) {
		// eslint-disable-next-line react/no-this-in-sfc
		this.x = x;
		// eslint-disable-next-line react/no-this-in-sfc
		this.y = y;
	}

	toString(): string {
		// eslint-disable-next-line react/no-this-in-sfc
		return `Vector2 [X: ${this.x}, Y: ${this.y}]`;
	}
}

if (!styles.hithere) {
	throw new Error('should support SCSS modules');
}

// Use it to test that UI does not regress on weird CSS
// import './weird-css.css';

export const Index: React.FC = () => {
	const inputProps = getInputProps();

	const calculateMetadata: CalculateMetadataFunction<
		z.infer<typeof dynamicDurationSchema>
	> = useMemo(() => {
		return async ({props}) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const shouldLog = (..._data: unknown[]) => undefined;
			// To test logging
			// const shouldLog = console.log;
			const foo = function* () {
				yield 'a';
				yield 'b';
				yield 'c';
			};
			shouldLog('');
			shouldLog('');
			shouldLog('');
			shouldLog('');

			shouldLog('objects', {a: 'string'});
			shouldLog('boolean:', false);
			shouldLog('number:', 1);
			shouldLog('symbol', Symbol('hi'));
			shouldLog('Date:', new Date());
			shouldLog('bigint:', BigInt(123));
			shouldLog('function:', () => 'hi');
			shouldLog('array:', [1, 2, 3]);
			shouldLog('regex:', /abc/);
			shouldLog('');
			shouldLog('');
			shouldLog('');
			shouldLog('');
			shouldLog('Hello World ArrayBuffer', new ArrayBuffer(1));
			shouldLog('Hello World DataView', new DataView(new ArrayBuffer(1)));
			shouldLog('Hello World Error', new Error('hithere'));
			shouldLog('Hello World Generator', foo());
			shouldLog('Hello World Iterator', [1, 2, 3].values());
			const map = new Map();
			map.set('a', 1);
			shouldLog('Hello World Map', map);
			shouldLog('Hello World Node', document.createElement('div'));
			shouldLog('Hello World null', null);
			shouldLog(
				'Hello World Promise',
				new Promise<void>((resolve) => {
					resolve();
				}),
			);
			shouldLog('Hello World Proxy', new Proxy(document, {}));
			shouldLog('Hello World RegExp', /abc/);
			shouldLog('Hello World Set', {a: [1, 2, 3]});
			shouldLog('Hello World TypedArray', new Uint8Array([1, 2, 3]));
			const wm3 = new WeakMap();
			const o1 = {};
			wm3.set(o1, 'azerty');
			const ws = new WeakSet();
			const foo2 = {};

			ws.add(foo2);

			shouldLog('Hello World WeakMap', wm3);
			shouldLog('Hello World WeakSet', ws);

			await new Promise((r) => {
				setTimeout(r, 1000);
			});

			return {
				durationInFrames: props.duration,
				fps: 30,
			};
		};
	}, []);

	const failingCalculateMetadata: CalculateMetadataFunction<
		z.infer<typeof dynamicDurationSchema>
	> = useCallback(async () => {
		await new Promise((r) => {
			setTimeout(r, 1000);
		});
		// Enable this for testing, however it will break getCompositions():
		// throw new Error('Failed to calculate metadata');
		return {
			props: {duration: 100},
		};
	}, []);

	const syncCalculateMetadata: CalculateMetadataFunction<
		z.infer<typeof dynamicDurationSchema>
	> = useCallback(() => {
		// Enable this for testing, however it will break getCompositions():
		// throw new Error('Failed to calculate metadata');
		return {
			props: {duration: 100},
		};
	}, []);

	return (
		<>
			<Folder name="dynamic-parameters">
				<Composition
					id="dynamic-length"
					component={DynamicDuration}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					calculateMetadata={calculateMetadata}
					schema={dynamicDurationSchema}
					defaultProps={{duration: 200}}
				/>
				<Composition
					id="failing-dynamic-length"
					component={DynamicDuration}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					calculateMetadata={failingCalculateMetadata}
					schema={dynamicDurationSchema}
					defaultProps={{duration: 50}}
				/>
				<Composition
					id="huge-payload"
					component={HugePayload}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={2}
					calculateMetadata={() => {
						return {
							props: {
								str: 'potato'.repeat(1000000),
								date: new Date('2020-01-01'),
								file: staticFile('nested/mp4.png'),
							},
						};
					}}
					schema={hugePayloadSchema}
					defaultProps={{
						str: 'potate',
						file: staticFile('giphy.gif'),
						date: new Date('2020-01-01'),
					}}
				/>
				<Composition
					// Sending 140KB payload will not require the Lambda function to compress the props,
					// but once spawning the renderer function, then the input props as well as the resolved
					// combined together will take more than 256KB of space.
					// In that case, we need to compress one of them.
					id="140kb-payload"
					component={HugePayload}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={2}
					calculateMetadata={() => {
						return {
							props: {
								str: 'a'.repeat(140 * 1000),
								date: new Date('2020-01-01'),
								file: staticFile('nested/mp4.png'),
								dontCareAboutSize: true,
							},
						};
					}}
					schema={hugePayloadSchema}
					defaultProps={{
						str: 'potato',
						file: staticFile('giphy.gif'),
						date: new Date('2020-01-01'),
					}}
				/>
				<Composition
					id="sync-dynamic-length"
					component={DynamicDuration}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					calculateMetadata={syncCalculateMetadata}
					schema={dynamicDurationSchema}
					defaultProps={{duration: 50}}
				/>
			</Folder>
			<Folder name="components">
				<Composition
					id="looped"
					lazyComponent={() => import('./LoopedVideo')}
					durationInFrames={200}
					fps={60}
					height={1080}
					width={1080}
				/>
				<Composition
					fps={30}
					id="cancel-render"
					width={920}
					height={720}
					component={CancelRender}
					durationInFrames={100}
				/>
				<Composition
					id="iframe"
					lazyComponent={() => import('./IframeTest')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={10}
				/>
				<Composition
					id="stagger-test"
					component={SeriesTesting}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="freeze-example"
					component={FreezeExample}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={300}
				/>
			</Folder>
			<Folder name="spring">
				<Composition
					id="base-spring"
					component={BaseSpring}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="spring-with-duration"
					component={SpringWithDuration}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
				/>
			</Folder>
			<Folder name="regression-testing">
				<Composition
					id="missing-img"
					component={MissingImg}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={10}
				/>
				<Composition
					id="ten-frame-tester"
					component={TenFrameTester}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={10}
				/>

				<Composition
					id="framer"
					component={Framer}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={10000}
				/>
				<Composition
					id="skip-zero-frame"
					component={SkipZeroFrame}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="scripts"
					component={Scripts}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="many-audio"
					component={ManyAudio}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={30}
				/>
				<Composition
					id="Timeout"
					component={Timeout}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="error-on-frame-10"
					component={ErrorOnFrame10}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={1000000}
				/>
				<Composition
					id="CJK-chars-明金"
					component={ErrorOnFrame10}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={1000000}
				/>
				<MyCtx.Provider
					value={{
						hi: () => 'hithere',
					}}
				>
					<Still
						id="wrapped-in-context"
						component={WrappedInContext}
						width={1280}
						height={720}
					/>
				</MyCtx.Provider>
				{INCLUDE_COMP_BREAKING_GET_COMPOSITIONS ? (
					<Composition
						id="circular-structure"
						component={Framer}
						width={1080}
						height={1080}
						durationInFrames={30}
						fps={30}
						calculateMetadata={() => {
							const objectA = {
								name: 'Object A',
							};

							const objectB = {
								name: 'Object B',
								linkedObject: objectA, // ObjectB links to objectA
							};

							// @ts-expect-error linked object
							objectA.linkedObject = objectB;

							return {
								props: objectA,
							};
						}}
					/>
				) : null}
				<Composition
					id="class-serialization"
					component={ClassSerialization}
					width={1080}
					height={1080}
					durationInFrames={30}
					fps={30}
					defaultProps={{
						calculated: new Vector2(15, 10),
					}}
				/>
			</Folder>
			<Folder name="creatives">
				<Composition
					id="drop-dots"
					lazyComponent={() => import('./DropDots/DropDots')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={180 * 30}
					defaultProps={{
						opacity: 1,
						volume: 0.4,
					}}
				/>
				<Composition
					id="tiles"
					lazyComponent={() => import('./Tiles')}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={90}
				/>
				<Composition
					id="title"
					lazyComponent={() => import('./Title')}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={90}
					defaultProps={{
						line1: 'Test',
						line2: 'text',
					}}
				/>
				<Still
					id="FitText"
					component={FitText}
					width={800}
					height={900}
					schema={fitTextSchema}
					defaultProps={{
						line: 'Test',
					}}
				/>
				<Composition
					id="beta-text"
					component={BetaText}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={3 * 30}
					defaultProps={{
						word1: 'hithere' as const,
						color: ['rgba(19, 124, 45, 0.059)' as const],
					}}
					schema={betaTextSchema}
				/>
				<Composition
					id="green"
					component={Green}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={2}
				/>
				<Composition
					id="react-svg"
					lazyComponent={() => import('./ReactSvg')}
					width={1920}
					height={1080}
					fps={60}
					durationInFrames={300}
					defaultProps={{
						transparent: true,
					}}
				/>
			</Folder>
			<Folder name="video-tests">
				<Composition
					id="hls"
					component={HlsDemo}
					width={1920}
					height={1080}
					durationInFrames={100}
					fps={30}
				/>
				<Composition
					id="video-testing-mp4"
					component={VideoTesting}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					defaultProps={{
						offthread: false,
						codec: 'mp4' as const,
					}}
				/>
				<Composition
					id="video-testing-mp4-offthread"
					component={VideoTesting}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					defaultProps={{
						offthread: true,
						codec: 'mp4' as const,
					}}
				/>
				<Composition
					id="OffthreadRemoteVideo"
					component={OffthreadRemoteVideo}
					fps={30}
					calculateMetadata={calculateMetadataFn}
					defaultProps={{
						src: 'https://videos.pexels.com/video-files/5530402/5530402-uhd_3840_2160_25fps.mp4',
					}}
				/>
				<Composition
					id="OffthreadVideoToCanvas"
					component={OffthreadVideoToCanvas}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={100}
				/>
				<Composition
					id="video-testing-webm"
					component={VideoTesting}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					defaultProps={{
						offthread: false,
						codec: 'webm' as const,
					}}
				/>
				<Composition
					id="video-testing-webm-offthread"
					component={VideoTesting}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
					defaultProps={{
						offthread: true,
						codec: 'webm' as const,
					}}
				/>
				<Composition
					id="remote-video"
					component={RemoteVideo}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={600}
				/>
				<Composition
					id="corrupt-video"
					component={CorruptVideo}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={2000}
				/>
				<Composition
					id="2hrvideo"
					component={InfinityVideo}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={2 * 60 * 60 * 30}
				/>

				<Composition
					id="video-speed"
					component={VideoSpeed}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="video-on-canvas"
					component={VideoOnCanvas}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="greenscreen"
					component={Greenscreen}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={100}
				/>
			</Folder>
			<Folder name="still-tests">
				<Still
					id="still-zoom"
					component={StillZoom}
					width={1800}
					height={2200}
				/>
				<Still
					id="still-helloworld"
					defaultProps={{message: 'Hello from default!'}}
					component={StillHelloWorld}
					width={1920}
					height={1080}
				/>
			</Folder>
			<Folder name="features">
				<Still
					id="mdx-test"
					lazyComponent={() => import('./MdxTest')}
					width={1080}
					height={1080}
				/>
				<Still
					id="watch-static"
					component={WatchStaticDemo}
					width={1080}
					height={1080}
				/>
				<Composition
					id="color-interpolation"
					component={ColorInterpolation}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="text-stroke"
					component={TextStroke}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="native-buffer-state"
					component={NativeBufferState}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={200}
				/>
				<Composition
					id="native-buffer-state-for-video"
					component={NativeBufferStateForVideo}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={200}
				/>
				<Composition
					id="native-buffer-state-for-image"
					component={NativeBufferStateForImage}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={200}
				/>
				<Composition
					id="default-codec"
					component={ColorInterpolation}
					width={1280}
					height={720}
					fps={30}
					calculateMetadata={() => {
						return {
							defaultCodec: 'aac',
						};
					}}
					durationInFrames={100}
				/>
				<Still
					id="static-demo"
					component={StaticDemo}
					width={1000}
					height={1000}
					defaultProps={{flag: false}}
					calculateMetadata={async () => {
						return {};
					}}
				/>
				<Still id="font-demo" component={FontDemo} width={1000} height={1000} />
				<Composition
					id="dynamic-duration"
					component={VideoTesting}
					width={1080}
					height={1080}
					fps={30}
					// Change the duration of the video dynamically by passing
					// `--props='{"duration": 100}'`
					durationInFrames={(inputProps?.duration as number) ?? 20}
					defaultProps={{
						codec: 'mp4' as const,
						offthread: false,
					}}
				/>
				<Composition
					id="nested"
					lazyComponent={() => import('./NestedSequences')}
					durationInFrames={200}
					fps={60}
					height={1080}
					width={1080}
				/>
			</Folder>
			<Folder name="audio-tests">
				<Composition
					id="complex-sounds"
					component={ComplexSounds}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={720}
					lazyComponent={undefined}
				/>
				<Composition
					id="22khz"
					component={TwentyTwoKHzAudio}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={90}
				/>
				<Composition
					id="offline-audio-buffer"
					lazyComponent={() => import('./OfflineAudioBuffer')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={100}
				/>
				<Composition
					id="audio-testing-mute"
					lazyComponent={() => import('./AudioTestingMute')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={300}
				/>
				<Composition
					id="audio-testing"
					lazyComponent={() => import('./AudioTesting')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={300}
				/>
				<Composition
					id="audio-testing-short-loop"
					lazyComponent={() => import('./AudioTesting/ShortLoop')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={300}
				/>
				<Composition
					id="audio-testing-amplify"
					lazyComponent={() => import('./AudioTesting/Amplify')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={120}
				/>
				<Composition
					id="audio-testing-base64"
					lazyComponent={() => import('./AudioTesting/Base64')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={300}
				/>
				<Composition
					id="audio-visualization"
					lazyComponent={() => import('./AudioVisualization')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={180 * 30}
				/>
				<Composition
					id="loop-audio"
					lazyComponent={() => import('./LoopAudio')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={180 * 30}
				/>
				<Composition
					id="loop-trimmed-audio"
					lazyComponent={() => import('./LoopTrimmedAudio')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={180 * 30}
				/>
			</Folder>
			<Folder name="three">
				<Still id="Orb" component={OrbScene} width={2000} height={2000} />
				<Composition
					id="three-basic"
					component={ThreeBasic}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={600}
				/>
				<Composition
					id="three-html"
					component={ThreeHtml}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={600}
				/>
				<Composition
					id="use-video-texture"
					component={VideoTextureDemo}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={600}
					defaultProps={{
						baseScale: 1,
						deviceType: 'phone',
						phoneColor: 'black',
						textureType: 'video',
					}}
				/>
				<Composition
					id="use-offthread-video-texture"
					component={VideoTextureDemo}
					width={1280}
					height={720}
					fps={30}
					durationInFrames={600}
					defaultProps={{
						baseScale: 1,
						deviceType: 'phone',
						phoneColor: 'black',
						textureType: 'offthreadvideo',
					}}
				/>
			</Folder>
			<Folder name="lottie">
				<Composition
					id="cybertruck"
					lazyComponent={() => import('./Lottie/Cybertruck')}
					durationInFrames={500}
					fps={30}
					height={850}
					width={850}
				/>
				<Composition
					id="halloween-balloons"
					lazyComponent={() => import('./Lottie/Halloween/Balloons')}
					durationInFrames={90}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="halloween-pumpkin"
					lazyComponent={() => import('./Lottie/Halloween/Pumpkin')}
					durationInFrames={150}
					fps={30}
					height={1200}
					width={1600}
				/>
				<Composition
					id="exploding-bird"
					lazyComponent={() => import('./Lottie/ExplodingBird')}
					durationInFrames={300}
					fps={30}
					height={850}
					width={850}
				/>
				<Composition
					id="image-in-lottie"
					lazyComponent={() => import('./Lottie/ImageInLottie')}
					durationInFrames={300}
					fps={30}
					height={850}
					width={850}
				/>
				<Composition
					id="LottieInitializationBugfix"
					lazyComponent={() => import('./Lottie/LottieInitializationBugfix')}
					durationInFrames={300}
					fps={30}
					height={850}
					width={850}
				/>
				<Composition
					id="loader"
					lazyComponent={() => import('./Lottie/Loader')}
					durationInFrames={240}
					fps={60}
					height={576}
					width={576}
				/>
			</Folder>
			<Folder name="paths">
				<Composition
					id="path-evolve"
					lazyComponent={() => import('./Paths/PathEvolve')}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="path-morph"
					lazyComponent={() => import('./Paths/PathMorph')}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="scale-path"
					component={ScalePath}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="path-warp"
					component={WarpDemoOuter}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="path-warp-2"
					component={WarpDemo2}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="shapes-morph"
					component={ShapesMorph}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
				<Composition
					id="slice-path"
					component={SlicePath}
					durationInFrames={500}
					fps={30}
					height={1080}
					width={1080}
				/>
			</Folder>
			<Folder name="gif">
				<Composition
					id="gif"
					lazyComponent={() => import('./GifTest')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={250}
				/>
				<Composition
					id="gif-duration"
					lazyComponent={() => import('./GifTest/gif-duration')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="gif-fill-modes"
					lazyComponent={() => import('./GifTest/fill-modes')}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="gif-loop-behavior"
					lazyComponent={() => import('./GifTest/loop-behavior')}
					width={1920}
					height={1080}
					fps={30}
					durationInFrames={540}
				/>
			</Folder>
			<Folder name="og-images">
				<Composition
					id="expert"
					component={Expert}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
			</Folder>

			<Folder name="shapes">
				<Composition
					id="circle-test"
					component={CircleTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="rect-test"
					component={RectTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="triangle-test"
					component={TriangleTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="ellipse-test"
					component={EllipseTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
				<Composition
					id="star-test"
					component={StarTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
				/>
			</Folder>
			<Folder name="Rive">
				<Composition
					id="rive-vehicle"
					component={RiveVehicle}
					width={1200}
					height={630}
					fps={30}
					schema={z.object({
						union: z.array(
							z.discriminatedUnion('type', [
								z.object({
									type: z.literal('car'),
									color: z.string(),
									obj: z.array(
										z.object({
											link: z.string(),
										}),
									),
								}),
								z.object({
									type: z.literal('boat'),
									depth: z.number(),
								}),
							]),
						),
					})}
					defaultProps={{
						union: [
							{type: 'boat' as const, depth: 10},
							{type: 'car' as const, color: 'red', obj: [{link: 'hi there'}]},
							{type: 'car' as const, color: '', obj: [{link: ''}]},
							{type: 'car' as const, color: '', obj: [{link: ''}]},
							{type: 'car' as const, color: '', obj: [{link: ''}]},
							{type: 'car' as const, color: '', obj: [{link: ''}]},
							{type: 'car' as const, color: '', obj: [{link: ''}]},
						],
					}}
					durationInFrames={150}
				/>
			</Folder>
			<Folder name="Premount">
				<Composition
					id="premounted"
					component={PremountedExample}
					fps={30}
					height={1080}
					durationInFrames={300}
					width={1080}
				/>
				<Composition
					id="premounted-remote"
					component={PremountedRemoteVideos}
					fps={30}
					height={1080}
					durationInFrames={300}
					width={1080}
				/>
			</Folder>
			<Folder name="Transitions">
				<Composition
					id="basic-transition"
					component={BasicTransition}
					fps={30}
					height={1080}
					durationInFrames={300}
					width={1920}
				/>
				<Composition
					id="audio-transition"
					component={AudioTransition}
					fps={30}
					height={1080}
					durationInFrames={300}
					width={1920}
				/>
				<Composition
					id="custom-transition"
					component={CustomTransition}
					fps={30}
					height={1080}
					durationInFrames={300}
					width={1920}
				/>
			</Folder>
			<Folder name="Schema">
				<Composition
					id="schema-test"
					component={SchemaTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
					schema={schemaTestSchema}
					defaultProps={{
						title: 'sdasds',
						delay: 5.2,
						color: '#df822a',
						list: [{name: 'first', age: 12}],
						description: 'Sample description \nOn multiple lines',
						dropdown: 'a' as const,
						superSchema: [
							{type: 'a' as const, a: {a: 'hi'}},
							{type: 'b' as const, b: {b: 'hi'}},
						],
					}}
				/>
				{/**
				 // @ts-expect-error */}
				<Composition
					id="impossible-to-save"
					component={SchemaTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
					schema={schemaTestSchema}
				/>
				<Composition
					id="array-schema"
					component={ArrayTest}
					width={1200}
					height={630}
					fps={30}
					durationInFrames={150}
					// @ts-expect-error Needs an object
					schema={schemaArrayTestSchema}
					defaultProps={{}}
				/>
			</Folder>
			<Folder name="TailwindCSS">
				<Composition
					id="tailwind"
					component={Tailwind}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={60}
				/>
			</Folder>
			<Composition
				id="Layers"
				component={Layers}
				width={1080}
				height={1080}
				durationInFrames={200}
				fps={30}
				defaultProps={{}}
			/>
			<Composition
				id="WidthHeight"
				component={WidthHeightSequences}
				fps={30}
				height={1080}
				width={1080}
				durationInFrames={120}
			/>
			<Composition
				id="RetryDelayRender"
				component={RetryDelayRender}
				fps={30}
				height={1080}
				width={1080}
				durationInFrames={120}
			/>
			<Folder name="Skia">
				<Composition
					id="skia-shader"
					component={RuntimeShaderDemo}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={120}
				/>
				<Composition
					id="skia-zoomblur"
					component={RuntimeShaderZoomBlur}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={120}
				/>
			</Folder>
			<Folder name="studio-apis">
				<Composition
					id="save-default-props"
					component={SaveDefaultProps}
					fps={30}
					durationInFrames={100}
					height={200}
					width={200}
					schema={saveStudioSchema}
					defaultProps={{color: 'green'}}
				/>
				<Composition
					id="restart-studio"
					component={ClickUpdate}
					fps={30}
					durationInFrames={100}
					height={200}
					width={200}
					schema={saveStudioSchema}
					defaultProps={{color: 'green'}}
				/>
				<Composition
					id="write-static-file"
					component={WriteStaticFile}
					fps={30}
					durationInFrames={100}
					height={200}
					width={200}
					schema={saveStudioSchema}
					defaultProps={{color: 'green'}}
				/>
				<Composition
					id="delete-static-file"
					component={DeleteStaticFile}
					fps={30}
					durationInFrames={100}
					height={200}
					width={200}
					defaultProps={{color: 'green'}}
				/>
				<Composition
					id="trigger-calculate-metadata"
					component={TriggerCalculateMetadata}
					fps={30}
					durationInFrames={100}
					height={200}
					width={200}
					calculateMetadata={async () => {
						await new Promise((r) => {
							setTimeout(r, 1000);
						});
						return {};
					}}
					defaultProps={{color: 'green'}}
				/>
			</Folder>
			<Folder name="Artifacts">
				<Composition
					id="subtitle"
					component={SubtitleArtifact}
					fps={30}
					height={1000}
					width={1000}
					durationInFrames={10}
				/>
			</Folder>
			<Folder name="MediaErrorHandling">
				<Composition
					id="AudioError"
					component={HandleAudioRenderError}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={10_000}
				/>
			</Folder>
			<Folder name="AnimatedEmojis">
				<Composition
					id="AnimatedEmojis"
					component={UseanimatedEmojis}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={10_000}
				/>
			</Folder>
			<Folder name="VideoParser">
				<Composition
					id="VideoParser"
					component={VideoParser}
					fps={30}
					height={1080}
					width={1080}
					durationInFrames={10_000}
				/>
			</Folder>
			<Still
				id="DecoderDemo"
				component={DecoderDemo}
				height={1000}
				width={1024}
			/>
			<Still id="Emojis" component={EmojiTestbed} height={800} width={1024} />
			<Composition
				id="google-fonts-picker"
				component={GoogleFontsPicker}
				schema={googleFontsPickerSchema}
				defaultProps={{}}
				durationInFrames={10 * 30}
				fps={30}
				width={256}
				height={256}
			/>
		</>
	);
};
