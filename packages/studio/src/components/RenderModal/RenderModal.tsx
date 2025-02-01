import type {
	AudioCodec,
	ChromeMode,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {
	RequiredChromiumOptions,
	UiOpenGlOptions,
} from '@remotion/studio-shared';
import {getDefaultOutLocation} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {BLUE, BLUE_DISABLED} from '../../helpers/colors';
import {
	envVariablesArrayToObject,
	envVariablesObjectToArray,
} from '../../helpers/convert-env-variables';
import {useRenderModalSections} from '../../helpers/render-modal-sections';
import {useKeybinding} from '../../helpers/use-keybinding';
import {Checkmark} from '../../icons/Checkmark';
import {AudioIcon} from '../../icons/audio';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import {PicIcon} from '../../icons/frame';
import {GearIcon} from '../../icons/gear';
import {GifIcon} from '../../icons/gif';
import {ModalsContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import {Button} from '../Button';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {getMaxModalHeight, getMaxModalWidth} from '../ModalContainer';
import {ModalHeader} from '../ModalHeader';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {
	optionsSidebarTabs,
	persistSelectedOptionsSidebarPanel,
} from '../OptionsPanel';
import {
	addSequenceRenderJob,
	addStillRenderJob,
	addVideoRenderJob,
} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {VerticalTab} from '../Tabs/vertical';
import {useCrfState} from './CrfSetting';
import {DataEditor} from './DataEditor';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalAdvanced} from './RenderModalAdvanced';
import {RenderModalAudio} from './RenderModalAudio';
import {RenderModalBasic} from './RenderModalBasic';
import {RenderModalGif} from './RenderModalGif';
import type {QualityControl} from './RenderModalPicture';
import {RenderModalPicture} from './RenderModalPicture';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from './ResolveCompositionBeforeModal';
import {getDefaultCodecs} from './get-default-codecs';
import {getStringBeforeSuffix} from './get-string-before-suffix';
import {validateOutnameGui} from './out-name-checker';

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'success';
	  }
	| {
			type: 'load';
	  }
	| {
			type: 'error';
	  };

const initialState: State = {type: 'idle'};

type Action =
	| {
			type: 'start';
	  }
	| {
			type: 'succeed';
	  }
	| {
			type: 'fail';
	  };

const reducer = (state: State, action: Action): State => {
	if (action.type === 'start') {
		return {
			type: 'load',
		};
	}

	if (action.type === 'fail') {
		return {
			type: 'error',
		};
	}

	if (action.type === 'succeed') {
		return {
			type: 'success',
		};
	}

	return state;
};

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	borderBottom: '1px solid black',
};

const optionsPanel: React.CSSProperties = {
	display: 'flex',
	width: '100%',
};

const horizontalLayout: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflowY: 'auto',
	flex: 1,
};

const leftSidebar: React.CSSProperties = {
	padding: 12,
};

const horizontalTab: React.CSSProperties = {
	width: 250,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	textAlign: 'left',
	fontSize: 16,
	fontWeight: 'bold',
	paddingLeft: 15,
	paddingTop: 12,
	paddingBottom: 12,
};

const iconContainer: React.CSSProperties = {
	width: 20,
	height: 20,
	marginRight: 15,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const icon: React.CSSProperties = {
	color: 'currentcolor',
	height: 20,
};

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

const flexer: React.CSSProperties = {
	flex: 1,
};

const outer: React.CSSProperties = {
	width: getMaxModalWidth(1000),
	height: getMaxModalHeight(640),
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
};

type RenderModalProps = {
	readonly compositionId: string;
	readonly initialFrame: number;
	readonly initialVideoImageFormat: VideoImageFormat;
	readonly initialStillImageFormat: StillImageFormat;
	readonly initialJpegQuality: number;
	readonly initialScale: number;
	readonly initialLogLevel: LogLevel;
	readonly initialConcurrency: number;
	readonly minConcurrency: number;
	readonly maxConcurrency: number;
	readonly initialMuted: boolean;
	readonly initialEnforceAudioTrack: boolean;
	readonly initialProResProfile: ProResProfile;
	readonly initialx264Preset: X264Preset;
	readonly initialPixelFormat: PixelFormat;
	readonly initialVideoBitrate: string | null;
	readonly initialAudioBitrate: string | null;
	readonly initialEveryNthFrame: number;
	readonly initialNumberOfGifLoops: number | null;
	readonly initialDelayRenderTimeout: number;
	readonly initialEnvVariables: Record<string, string>;
	readonly initialDisableWebSecurity: boolean;
	readonly initialGl: OpenGlRenderer | null;
	readonly initialIgnoreCertificateErrors: boolean;
	readonly initialOffthreadVideoCacheSizeInBytes: number | null;
	readonly initialColorSpace: ColorSpace;
	readonly initialEncodingMaxRate: string | null;
	readonly initialEncodingBufferSize: string | null;
	readonly initialUserAgent: string | null;
	readonly initialBeep: boolean;
	readonly initialRepro: boolean;
	readonly defaultProps: Record<string, unknown>;
	readonly inFrameMark: number | null;
	readonly outFrameMark: number | null;
	readonly initialMultiProcessOnLinux: boolean;
	readonly defaultConfigurationVideoCodec: Codec | null;
	readonly defaultConfigurationAudioCodec: AudioCodec | null;
	readonly initialForSeamlessAacConcatenation: boolean;
	readonly initialHardwareAcceleration: HardwareAccelerationOption;
	readonly renderTypeOfLastRender: RenderType | null;
	readonly initialChromeMode: ChromeMode;
	readonly defaultMetadata: Record<string, string> | null;
};

const RenderModal: React.FC<
	Omit<RenderModalProps, 'compositionId'> & {
		readonly defaultConfigurationVideoCodec: Codec | null;
	}
> = ({
	initialFrame,
	initialVideoImageFormat,
	initialStillImageFormat,
	initialJpegQuality,
	initialScale,
	initialLogLevel,
	initialConcurrency,
	maxConcurrency,
	minConcurrency,
	initialMuted,
	initialEnforceAudioTrack,
	initialProResProfile,
	initialx264Preset,
	initialPixelFormat,
	initialVideoBitrate,
	initialAudioBitrate,
	initialEveryNthFrame,
	initialNumberOfGifLoops,
	initialDelayRenderTimeout,
	initialOffthreadVideoCacheSizeInBytes,
	initialEnvVariables,
	initialDisableWebSecurity,
	initialGl,
	initialIgnoreCertificateErrors,
	initialEncodingBufferSize,
	initialEncodingMaxRate,
	initialUserAgent,
	defaultProps,
	inFrameMark,
	outFrameMark,
	initialColorSpace,
	initialMultiProcessOnLinux,
	defaultConfigurationAudioCodec,
	defaultConfigurationVideoCodec,
	initialBeep,
	initialRepro,
	initialForSeamlessAacConcatenation,
	renderTypeOfLastRender,
	initialHardwareAcceleration,
	defaultMetadata,
	initialChromeMode,
}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error(
			'Should not be able to render without resolving comp first',
		);
	}

	const {
		resolved: {result: resolvedComposition},
		unresolved: unresolvedComposition,
	} = context;

	const isMounted = useRef(true);

	const [isVideo] = useState(() => {
		return typeof resolvedComposition.durationInFrames === 'undefined'
			? true
			: resolvedComposition.durationInFrames > 1;
	});

	const [
		{
			initialAudioCodec,
			initialRenderType,
			initialVideoCodec,
			initialVideoCodecForAudioTab,
			initialVideoCodecForVideoTab,
		},
	] = useState(() => {
		return getDefaultCodecs({
			defaultConfigurationVideoCodec,
			compositionDefaultVideoCodec: resolvedComposition.defaultCodec,
			defaultConfigurationAudioCodec,
			renderType: renderTypeOfLastRender ?? (isVideo ? 'video' : 'still'),
		});
	});

	const [state, dispatch] = useReducer(reducer, initialState);
	const [unclampedFrame, setFrame] = useState(() => initialFrame);
	const [saving, setSaving] = useState<boolean>(false);
	const [stillImageFormat, setStillImageFormat] = useState<StillImageFormat>(
		() => initialStillImageFormat,
	);
	const [videoImageFormat, setVideoImageFormat] = useState<VideoImageFormat>(
		() => initialVideoImageFormat,
	);
	const [sequenceImageFormat, setSequenceImageFormat] =
		useState<VideoImageFormat>(() =>
			initialStillImageFormat === 'jpeg' ? 'jpeg' : 'png',
		);
	const [concurrency, setConcurrency] = useState(() => initialConcurrency);
	const [videoCodecForVideoTab, setVideoCodecForVideoTab] = useState<Codec>(
		() => initialVideoCodecForVideoTab,
	);
	const [userSelectedAudioCodec, setUserSelectedAudioCodec] =
		useState<AudioCodec | null>(() => initialAudioCodec);
	const [separateAudioTo, setSeparateAudioTo] = useState<string | null>(null);

	const [envVariables, setEnvVariables] = useState<[string, string][]>(() =>
		envVariablesObjectToArray(initialEnvVariables).filter(
			([key]) => key !== 'NODE_ENV',
		),
	);

	const [initialOutName] = useState(() => {
		return getDefaultOutLocation({
			compositionName: resolvedComposition.id,
			defaultExtension:
				initialRenderType === 'still'
					? initialStillImageFormat
					: isVideo
						? BrowserSafeApis.getFileExtensionFromCodec(
								initialVideoCodec,
								initialAudioCodec,
							)
						: initialStillImageFormat,
			type: 'asset',
		});
	});

	const [videoCodecForAudioTab, setVideoCodecForAudioTab] = useState<Codec>(
		() => initialVideoCodecForAudioTab,
	);

	const [mutedState, setMuted] = useState(() => initialMuted);
	const [repro, setRepro] = useState(() => initialRepro);
	const [enforceAudioTrackState, setEnforceAudioTrackState] = useState(
		() => initialEnforceAudioTrack,
	);
	const [forSeamlessAacConcatenation, setForSeamlessAacConcatenation] =
		useState(() => initialForSeamlessAacConcatenation);

	const [renderMode, setRenderModeState] =
		useState<RenderType>(initialRenderType);
	const [jpegQuality, setJpegQuality] = useState<number>(
		() => initialJpegQuality,
	);
	const [scale, setScale] = useState(() => initialScale);
	const [logLevel, setLogLevel] = useState(() => initialLogLevel);
	const [disallowParallelEncoding, setDisallowParallelEncoding] =
		useState(false);
	const [disableWebSecurity, setDisableWebSecurity] = useState<boolean>(
		() => initialDisableWebSecurity,
	);
	const [beepOnFinish, setBeepOnFinish] = useState<boolean>(() => initialBeep);
	const [ignoreCertificateErrors, setIgnoreCertificateErrors] =
		useState<boolean>(() => initialIgnoreCertificateErrors);
	const [multiProcessOnLinux, setChromiumMultiProcessOnLinux] =
		useState<boolean>(() => initialMultiProcessOnLinux);
	const [openGlOption, setOpenGlOption] = useState<UiOpenGlOptions>(
		() => initialGl ?? 'default',
	);
	const [colorSpace, setColorSpace] = useState(() => initialColorSpace);
	const [userAgent, setUserAgent] = useState<string | null>(() =>
		initialUserAgent === null
			? null
			: initialUserAgent.trim() === ''
				? null
				: initialUserAgent,
	);

	const chromiumOptions: RequiredChromiumOptions = useMemo(() => {
		return {
			disableWebSecurity,
			ignoreCertificateErrors,
			gl: openGlOption === 'default' ? null : openGlOption,
			userAgent:
				userAgent === null ? null : userAgent.trim() === '' ? null : userAgent,
			enableMultiProcessOnLinux: multiProcessOnLinux,
		};
	}, [
		disableWebSecurity,
		ignoreCertificateErrors,
		openGlOption,
		userAgent,
		multiProcessOnLinux,
	]);

	const [outName, setOutName] = useState(() => initialOutName);
	const [endFrameOrNull, setEndFrame] = useState<number | null>(
		() => outFrameMark ?? null,
	);
	const [startFrameOrNull, setStartFrame] = useState<number | null>(
		() => inFrameMark ?? null,
	);
	const [proResProfileSetting, setProResProfile] = useState<ProResProfile>(
		() => initialProResProfile,
	);
	const [x264PresetSetting, setx264Preset] = useState<X264Preset>(
		() => initialx264Preset,
	);
	const [hardwareAcceleration, setHardwareAcceleration] =
		useState<HardwareAccelerationOption>(() => initialHardwareAcceleration);

	const [userPreferredPixelFormat, setPixelFormat] = useState<PixelFormat>(
		() => initialPixelFormat,
	);
	const [preferredQualityControlType, setQualityControl] =
		useState<QualityControl>(() =>
			initialVideoBitrate === null ? 'crf' : 'bitrate',
		);
	const [
		shouldHaveCustomTargetAudioBitrate,
		setShouldHaveCustomTargetAudioBitrate,
	] = useState(() => initialAudioBitrate !== null);

	const [customTargetAudioBitrate, setCustomTargetAudioBitrateValue] = useState(
		() => initialAudioBitrate ?? '320K',
	);
	const [customTargetVideoBitrate, setCustomTargetVideoBitrateValue] = useState(
		() => initialVideoBitrate ?? '1M',
	);
	const [encodingMaxRate, setEncodingMaxRate] = useState<string | null>(
		() => initialEncodingMaxRate ?? null,
	);
	const [encodingBufferSize, setEncodingBufferSize] = useState<string | null>(
		() => initialEncodingBufferSize ?? null,
	);
	const [limitNumberOfGifLoops, setLimitNumberOfGifLoops] = useState(
		() => initialNumberOfGifLoops !== null,
	);

	const [numberOfGifLoopsSetting, setNumberOfGifLoopsSetting] = useState(
		() => initialNumberOfGifLoops ?? 0,
	);
	const [delayRenderTimeout, setDelayRenderTimeout] = useState(
		() => initialDelayRenderTimeout,
	);
	const [chromeMode, setChromeMode] = useState(() => initialChromeMode);

	const [offthreadVideoCacheSizeInBytes, setOffthreadVideoCacheSizeInBytes] =
		useState<number | null>(initialOffthreadVideoCacheSizeInBytes);

	const codec = useMemo(() => {
		if (renderMode === 'audio') {
			return videoCodecForAudioTab;
		}

		return videoCodecForVideoTab;
	}, [videoCodecForAudioTab, renderMode, videoCodecForVideoTab]);

	const numberOfGifLoops = useMemo(() => {
		if (codec === 'gif' && limitNumberOfGifLoops) {
			return numberOfGifLoopsSetting;
		}

		return null;
	}, [codec, limitNumberOfGifLoops, numberOfGifLoopsSetting]);

	const audioBitrate = useMemo(() => {
		if (shouldHaveCustomTargetAudioBitrate) {
			return customTargetAudioBitrate;
		}

		return null;
	}, [customTargetAudioBitrate, shouldHaveCustomTargetAudioBitrate]);
	const supportsCrf = BrowserSafeApis.codecSupportsCrf(codec);
	const supportsVideoBitrate = BrowserSafeApis.codecSupportsVideoBitrate(codec);

	const supportsBothQualityControls = useMemo(() => {
		return supportsCrf && supportsVideoBitrate;
	}, [supportsCrf, supportsVideoBitrate]);

	const qualityControlType = useMemo(() => {
		if (supportsBothQualityControls) {
			return preferredQualityControlType;
		}

		if (supportsCrf) {
			return 'crf';
		}

		if (supportsVideoBitrate) {
			return 'bitrate';
		}

		return null;
	}, [
		preferredQualityControlType,
		supportsBothQualityControls,
		supportsCrf,
		supportsVideoBitrate,
	]);

	const videoBitrate = useMemo(() => {
		if (qualityControlType === 'bitrate') {
			return customTargetVideoBitrate;
		}

		return null;
	}, [customTargetVideoBitrate, qualityControlType]);

	const {crf, maxCrf, minCrf, setCrf} = useCrfState(codec);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const muted = useMemo(() => {
		if (renderMode === 'video') {
			return mutedState;
		}

		return false;
	}, [mutedState, renderMode]);

	const enforceAudioTrack = useMemo(() => {
		if (renderMode === 'video') {
			return enforceAudioTrackState;
		}

		if (renderMode === 'audio') {
			return enforceAudioTrackState;
		}

		return false;
	}, [enforceAudioTrackState, renderMode]);

	const proResProfile = useMemo(() => {
		if (renderMode === 'video' && codec === 'prores') {
			return proResProfileSetting;
		}

		return null;
	}, [codec, proResProfileSetting, renderMode]);

	const x264Preset = useMemo(() => {
		if (renderMode === 'video' && codec === 'h264') {
			return x264PresetSetting;
		}

		return null;
	}, [codec, x264PresetSetting, renderMode]);

	const [inputProps, setInputProps] = useState(() => defaultProps);

	const [metadata] = useState(() => defaultMetadata);

	const endFrame = useMemo((): number => {
		if (endFrameOrNull === null) {
			return resolvedComposition.durationInFrames - 1;
		}

		return Math.max(
			0,
			Math.min(resolvedComposition.durationInFrames - 1, endFrameOrNull),
		);
	}, [resolvedComposition.durationInFrames, endFrameOrNull]);

	const startFrame = useMemo((): number => {
		if (startFrameOrNull === null) {
			return 0;
		}

		return Math.max(0, Math.min(endFrame - 1, startFrameOrNull));
	}, [endFrame, startFrameOrNull]);

	const frame = useMemo(() => {
		const parsed = Math.floor(unclampedFrame);

		return Math.max(
			0,
			Math.min(resolvedComposition.durationInFrames - 1, parsed),
		);
	}, [resolvedComposition.durationInFrames, unclampedFrame]);

	const deriveFinalAudioCodec = useCallback(
		(passedVideoCodec: Codec, passedAudioCodec: AudioCodec | null) => {
			if (
				passedAudioCodec !== null &&
				(
					BrowserSafeApis.supportedAudioCodecs[
						passedVideoCodec
					] as readonly AudioCodec[]
				).includes(passedAudioCodec)
			) {
				return passedAudioCodec;
			}

			return BrowserSafeApis.defaultAudioCodecs[passedVideoCodec]
				.compressed as AudioCodec;
		},
		[],
	);

	const setDefaultOutName = useCallback(
		(
			options:
				| {type: 'sequence'}
				| {type: 'still'; imageFormat: StillImageFormat}
				| {
						type: 'render';
						codec: Codec;
						audioCodec: AudioCodec;
				  },
		) => {
			if (options.type === 'still') {
				setOutName((prev) => {
					const newFileName =
						getStringBeforeSuffix(prev) + '.' + options.imageFormat;
					return newFileName;
				});
			} else if (options.type === 'sequence') {
				setOutName((prev) => {
					const folderName = getStringBeforeSuffix(prev);
					return folderName;
				});
			} else {
				setOutName((prev) => {
					const codecSuffix = BrowserSafeApis.getFileExtensionFromCodec(
						options.codec,
						deriveFinalAudioCodec(options.codec, options.audioCodec),
					);

					const newFileName = getStringBeforeSuffix(prev) + '.' + codecSuffix;
					return newFileName;
				});
			}
		},
		[deriveFinalAudioCodec],
	);

	const setAudioCodec = useCallback(
		(newAudioCodec: AudioCodec) => {
			setUserSelectedAudioCodec(newAudioCodec);
			setDefaultOutName({
				type: 'render',
				codec: videoCodecForVideoTab,
				audioCodec: newAudioCodec,
			});
			setSeparateAudioTo((prev) => {
				if (prev === null) {
					return null;
				}

				const newExtension =
					BrowserSafeApis.getExtensionFromAudioCodec(newAudioCodec);
				const newFileName = getStringBeforeSuffix(prev) + '.' + newExtension;
				return newFileName;
			});
		},
		[setDefaultOutName, videoCodecForVideoTab],
	);

	const setCodec = useCallback(
		(newCodec: Codec) => {
			if (renderMode === 'audio') {
				setVideoCodecForAudioTab(newCodec);
			} else {
				setVideoCodecForVideoTab(newCodec);
			}

			setDefaultOutName({
				type: 'render',
				codec: newCodec,
				audioCodec: deriveFinalAudioCodec(newCodec, userSelectedAudioCodec),
			});
		},
		[
			userSelectedAudioCodec,
			deriveFinalAudioCodec,
			renderMode,
			setDefaultOutName,
		],
	);

	const setStillFormat = useCallback(
		(format: StillImageFormat) => {
			setStillImageFormat(format);
			setDefaultOutName({type: 'still', imageFormat: format});
		},
		[setDefaultOutName],
	);

	const {setSidebarCollapsedState} = useContext(SidebarContext);

	const onClickStill = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addStillRenderJob({
			compositionId: resolvedComposition.id,
			outName,
			imageFormat: stillImageFormat,
			jpegQuality,
			frame,
			scale,
			logLevel,
			chromiumOptions,
			delayRenderTimeout,
			envVariables: envVariablesArrayToObject(envVariables),
			inputProps,
			offthreadVideoCacheSizeInBytes,
			multiProcessOnLinux,
			beepOnFinish,
			metadata,
			chromeMode,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		setSidebarCollapsedState,
		dispatchIfMounted,
		resolvedComposition.id,
		outName,
		stillImageFormat,
		jpegQuality,
		frame,
		scale,
		logLevel,
		chromiumOptions,
		delayRenderTimeout,
		envVariables,
		inputProps,
		offthreadVideoCacheSizeInBytes,
		multiProcessOnLinux,
		beepOnFinish,
		setSelectedModal,
		metadata,
		chromeMode,
	]);

	const [everyNthFrameSetting, setEveryNthFrameSetting] = useState(
		() => initialEveryNthFrame,
	);

	const everyNthFrame = useMemo(() => {
		if (codec === 'gif') {
			return everyNthFrameSetting;
		}

		return 1;
	}, [codec, everyNthFrameSetting]);

	const audioCodec = deriveFinalAudioCodec(codec, userSelectedAudioCodec);

	const availablePixelFormats = useMemo(() => {
		return BrowserSafeApis.validPixelFormatsForCodec(codec);
	}, [codec]);

	const pixelFormat = useMemo(() => {
		if (
			(availablePixelFormats as string[]).includes(userPreferredPixelFormat)
		) {
			return userPreferredPixelFormat;
		}

		return availablePixelFormats[0];
	}, [availablePixelFormats, userPreferredPixelFormat]);

	const onClickVideo = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addVideoRenderJob({
			compositionId: resolvedComposition.id,
			outName,
			imageFormat: videoImageFormat,
			jpegQuality: stillImageFormat === 'jpeg' ? jpegQuality : null,
			scale,
			logLevel,
			codec,
			concurrency,
			crf: qualityControlType === 'crf' ? crf : null,
			endFrame,
			startFrame,
			muted,
			enforceAudioTrack,
			proResProfile,
			x264Preset,
			pixelFormat,
			audioBitrate,
			videoBitrate,
			everyNthFrame,
			numberOfGifLoops,
			delayRenderTimeout,
			audioCodec,
			disallowParallelEncoding,
			chromiumOptions,
			envVariables: envVariablesArrayToObject(envVariables),
			inputProps,
			offthreadVideoCacheSizeInBytes,
			colorSpace,
			multiProcessOnLinux,
			encodingBufferSize,
			encodingMaxRate,
			beepOnFinish,
			repro,
			forSeamlessAacConcatenation,
			separateAudioTo,
			metadata,
			hardwareAcceleration,
			chromeMode,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		setSidebarCollapsedState,
		dispatchIfMounted,
		resolvedComposition.id,
		outName,
		videoImageFormat,
		stillImageFormat,
		jpegQuality,
		scale,
		logLevel,
		codec,
		concurrency,
		qualityControlType,
		crf,
		endFrame,
		startFrame,
		muted,
		enforceAudioTrack,
		proResProfile,
		x264Preset,
		pixelFormat,
		audioBitrate,
		videoBitrate,
		everyNthFrame,
		numberOfGifLoops,
		delayRenderTimeout,
		audioCodec,
		disallowParallelEncoding,
		chromiumOptions,
		envVariables,
		inputProps,
		offthreadVideoCacheSizeInBytes,
		colorSpace,
		multiProcessOnLinux,
		encodingBufferSize,
		encodingMaxRate,
		beepOnFinish,
		repro,
		forSeamlessAacConcatenation,
		separateAudioTo,
		setSelectedModal,
		metadata,
		hardwareAcceleration,
		chromeMode,
	]);

	const onClickSequence = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addSequenceRenderJob({
			compositionId: resolvedComposition.id,
			outName,
			imageFormat: sequenceImageFormat,
			scale,
			logLevel,
			concurrency,
			endFrame,
			jpegQuality,
			startFrame,
			delayRenderTimeout,
			chromiumOptions,
			envVariables: envVariablesArrayToObject(envVariables),
			inputProps,
			offthreadVideoCacheSizeInBytes,
			disallowParallelEncoding,
			multiProcessOnLinux,
			beepOnFinish,
			repro,
			metadata,
			chromeMode,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		setSidebarCollapsedState,
		dispatchIfMounted,
		resolvedComposition.id,
		outName,
		sequenceImageFormat,
		scale,
		logLevel,
		concurrency,
		endFrame,
		jpegQuality,
		startFrame,
		delayRenderTimeout,
		chromiumOptions,
		envVariables,
		inputProps,
		offthreadVideoCacheSizeInBytes,
		disallowParallelEncoding,
		multiProcessOnLinux,
		beepOnFinish,
		repro,
		setSelectedModal,
		metadata,
		chromeMode,
	]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		if (renderMode === 'still') {
			return [
				{
					label: 'PNG',
					onClick: () => setStillFormat('png'),
					key: 'png',
					selected: stillImageFormat === 'png',
				},
				{
					label: 'JPEG',
					onClick: () => setStillFormat('jpeg'),
					key: 'jpeg',
					selected: stillImageFormat === 'jpeg',
				},
				{
					label: 'PDF',
					onClick: () => setStillFormat('pdf'),
					key: 'pdf',
					selected: stillImageFormat === 'pdf',
				},
				{
					label: 'WebP',
					onClick: () => setStillFormat('webp'),
					key: 'webp',
					selected: stillImageFormat === 'webp',
				},
			];
		}

		if (renderMode === 'sequence') {
			return [
				{
					label: 'PNG',
					onClick: () => setSequenceImageFormat('png'),
					key: 'png',
					selected: sequenceImageFormat === 'png',
				},
				{
					label: 'JPEG',
					onClick: () => setSequenceImageFormat('jpeg'),
					key: 'jpeg',
					selected: sequenceImageFormat === 'jpeg',
				},
			];
		}

		return [
			{
				label: 'PNG',
				onClick: () => setVideoImageFormat('png'),
				key: 'png',
				selected: videoImageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick: () => setVideoImageFormat('jpeg'),
				key: 'jpeg',
				selected: videoImageFormat === 'jpeg',
			},
		];
	}, [
		renderMode,
		videoImageFormat,
		stillImageFormat,
		setStillFormat,
		sequenceImageFormat,
	]);

	const setRenderMode = useCallback(
		(newRenderMode: RenderType) => {
			setRenderModeState(newRenderMode);
			if (newRenderMode === 'audio') {
				setDefaultOutName({
					type: 'render',
					codec: videoCodecForAudioTab,
					audioCodec: deriveFinalAudioCodec(
						videoCodecForAudioTab,
						userSelectedAudioCodec,
					),
				});
			}

			if (newRenderMode === 'video') {
				setDefaultOutName({
					type: 'render',
					codec: videoCodecForVideoTab,
					audioCodec: deriveFinalAudioCodec(
						videoCodecForVideoTab,
						userSelectedAudioCodec,
					),
				});
			}

			if (newRenderMode === 'still') {
				setDefaultOutName({type: 'still', imageFormat: stillImageFormat});
			}

			if (newRenderMode === 'sequence') {
				setDefaultOutName({type: 'sequence'});
			}
		},
		[
			videoCodecForAudioTab,
			userSelectedAudioCodec,
			deriveFinalAudioCodec,
			setDefaultOutName,
			stillImageFormat,
			videoCodecForVideoTab,
		],
	);

	const renderTabOptions = useMemo((): SegmentedControlItem[] => {
		if (resolvedComposition?.durationInFrames < 2) {
			return [
				{
					label: 'Still',
					onClick: () => {
						setRenderMode('still');
					},
					key: 'still',
					selected: renderMode === 'still',
				},
			];
		}

		return [
			{
				label: 'Still',
				onClick: () => {
					setRenderMode('still');
				},
				key: 'still',
				selected: renderMode === 'still',
			},
			{
				label: 'Video',
				onClick: () => {
					setRenderMode('video');
				},
				key: 'video',
				selected: renderMode === 'video',
			},
			{
				label: 'Audio',
				onClick: () => {
					setRenderMode('audio');
				},
				key: 'audio',
				selected: renderMode === 'audio',
			},
			{
				label: 'Image sequence',
				onClick: () => {
					setRenderMode('sequence');
				},
				key: 'sequence',
				selected: renderMode === 'sequence',
			},
		];
	}, [resolvedComposition?.durationInFrames, renderMode, setRenderMode]);

	const outnameValidation = validateOutnameGui({
		outName,
		codec,
		audioCodec,
		renderMode,
		stillImageFormat,
		separateAudioTo,
	});

	const {tab, setTab, shownTabs} = useRenderModalSections(renderMode, codec);

	const {registerKeybinding} = useKeybinding();

	const renderDisabled = state.type === 'load' || !outnameValidation.valid;

	const trigger = useCallback(() => {
		if (renderMode === 'still') {
			onClickStill();
		} else if (renderMode === 'sequence') {
			onClickSequence();
		} else {
			onClickVideo();
		}
	}, [renderMode, onClickStill, onClickSequence, onClickVideo]);

	useEffect(() => {
		if (renderDisabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: true,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			enter.unregister();
		};
	}, [registerKeybinding, renderDisabled, trigger]);

	const pixelFormatOptions = useMemo((): ComboboxValue[] => {
		return availablePixelFormats.map((option) => {
			return {
				label: option,
				onClick: () => setPixelFormat(option),
				key: option,
				id: option,
				keyHint: null,
				leftItem: pixelFormat === option ? <Checkmark /> : null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [availablePixelFormats, pixelFormat]);

	return (
		<div style={outer}>
			<ModalHeader title={`Render ${resolvedComposition.id}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={trigger}
					disabled={renderDisabled}
					style={{
						...buttonStyle,
						backgroundColor: outnameValidation.valid ? BLUE : BLUE_DISABLED,
					}}
				>
					{state.type === 'idle' ? `Render ${renderMode}` : 'Rendering...'}
					<ShortcutHint keyToPress="↵" cmdOrCtrl />
				</Button>
			</div>
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
					{shownTabs.includes('general') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'general'}
							onClick={() => setTab('general')}
						>
							<div style={iconContainer}>
								<FileIcon style={icon} />
							</div>
							General
						</VerticalTab>
					) : null}
					{shownTabs.includes('data') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'data'}
							onClick={() => setTab('data')}
						>
							<div style={iconContainer}>
								<DataIcon style={icon} />
							</div>
							Input Props
						</VerticalTab>
					) : null}
					{shownTabs.includes('picture') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'picture'}
							onClick={() => setTab('picture')}
						>
							<div style={iconContainer}>
								<PicIcon style={icon} />
							</div>
							Picture
						</VerticalTab>
					) : null}
					{shownTabs.includes('audio') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'audio'}
							onClick={() => setTab('audio')}
						>
							<div style={iconContainer}>
								<AudioIcon style={icon} />
							</div>
							Audio
						</VerticalTab>
					) : null}
					{shownTabs.includes('gif') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'gif'}
							onClick={() => setTab('gif')}
						>
							<div style={iconContainer}>
								<GifIcon style={icon} />
							</div>
							GIF
						</VerticalTab>
					) : null}
					{shownTabs.includes('advanced') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'advanced'}
							onClick={() => setTab('advanced')}
						>
							<div style={iconContainer}>
								<GearIcon style={icon} />
							</div>
							Other
						</VerticalTab>
					) : null}
				</div>
				<div style={optionsPanel} className={VERTICAL_SCROLLBAR_CLASSNAME}>
					{tab === 'general' ? (
						<RenderModalBasic
							codec={codec}
							resolvedComposition={resolvedComposition}
							frame={frame}
							imageFormatOptions={imageFormatOptions}
							outName={outName}
							proResProfile={proResProfile}
							renderMode={renderMode}
							setVideoCodec={setCodec}
							setFrame={setFrame}
							setOutName={setOutName}
							setProResProfile={setProResProfile}
							endFrame={endFrame}
							setEndFrame={setEndFrame}
							setStartFrame={setStartFrame}
							setVerboseLogging={setLogLevel}
							logLevel={logLevel}
							startFrame={startFrame}
							validationMessage={
								outnameValidation.valid ? null : outnameValidation.error.message
							}
						/>
					) : tab === 'picture' ? (
						<RenderModalPicture
							renderMode={renderMode}
							scale={scale}
							setScale={setScale}
							pixelFormat={pixelFormat}
							pixelFormatOptions={pixelFormatOptions}
							imageFormatOptions={imageFormatOptions}
							crf={crf}
							setCrf={setCrf}
							customTargetVideoBitrate={customTargetVideoBitrate}
							maxCrf={maxCrf}
							minCrf={minCrf}
							jpegQuality={jpegQuality}
							qualityControlType={qualityControlType}
							setJpegQuality={setJpegQuality}
							setColorSpace={setColorSpace}
							colorSpace={colorSpace}
							setCustomTargetVideoBitrateValue={
								setCustomTargetVideoBitrateValue
							}
							setQualityControl={setQualityControl}
							videoImageFormat={videoImageFormat}
							stillImageFormat={stillImageFormat}
							shouldDisplayQualityControlPicker={supportsBothQualityControls}
							encodingBufferSize={encodingBufferSize}
							setEncodingBufferSize={setEncodingBufferSize}
							encodingMaxRate={encodingMaxRate}
							setEncodingMaxRate={setEncodingMaxRate}
						/>
					) : tab === 'audio' ? (
						<RenderModalAudio
							muted={muted}
							renderMode={renderMode}
							setMuted={setMuted}
							codec={codec}
							audioCodec={audioCodec}
							setAudioCodec={setAudioCodec}
							enforceAudioTrack={enforceAudioTrack}
							setEnforceAudioTrackState={setEnforceAudioTrackState}
							customTargetAudioBitrate={customTargetAudioBitrate}
							setCustomTargetAudioBitrateValue={
								setCustomTargetAudioBitrateValue
							}
							setShouldHaveCustomTargetAudioBitrate={
								setShouldHaveCustomTargetAudioBitrate
							}
							shouldHaveCustomTargetAudioBitrate={
								shouldHaveCustomTargetAudioBitrate
							}
							forSeamlessAacConcatenation={forSeamlessAacConcatenation}
							setForSeamlessAacConcatenation={setForSeamlessAacConcatenation}
							separateAudioTo={separateAudioTo}
							setSeparateAudioTo={setSeparateAudioTo}
							outName={outName}
						/>
					) : tab === 'gif' ? (
						<RenderModalGif
							everyNthFrame={everyNthFrame}
							limitNumberOfGifLoops={limitNumberOfGifLoops}
							numberOfGifLoopsSetting={numberOfGifLoopsSetting}
							setEveryNthFrameSetting={setEveryNthFrameSetting}
							setLimitNumberOfGifLoops={setLimitNumberOfGifLoops}
							setNumberOfGifLoopsSetting={setNumberOfGifLoopsSetting}
						/>
					) : tab === 'data' ? (
						<DataEditor
							defaultProps={inputProps}
							setDefaultProps={setInputProps}
							unresolvedComposition={unresolvedComposition}
							mayShowSaveButton={false}
							propsEditType="input-props"
							saving={saving}
							setSaving={setSaving}
							readOnlyStudio={false}
						/>
					) : (
						<RenderModalAdvanced
							x264Preset={x264Preset}
							setx264Preset={setx264Preset}
							concurrency={concurrency}
							maxConcurrency={maxConcurrency}
							minConcurrency={minConcurrency}
							renderMode={renderMode}
							setConcurrency={setConcurrency}
							delayRenderTimeout={delayRenderTimeout}
							setDelayRenderTimeout={setDelayRenderTimeout}
							disallowParallelEncoding={disallowParallelEncoding}
							setDisallowParallelEncoding={setDisallowParallelEncoding}
							setDisableWebSecurity={setDisableWebSecurity}
							setIgnoreCertificateErrors={setIgnoreCertificateErrors}
							ignoreCertificateErrors={ignoreCertificateErrors}
							disableWebSecurity={disableWebSecurity}
							openGlOption={openGlOption}
							setOpenGlOption={setOpenGlOption}
							setEnvVariables={setEnvVariables}
							envVariables={envVariables}
							offthreadVideoCacheSizeInBytes={offthreadVideoCacheSizeInBytes}
							setOffthreadVideoCacheSizeInBytes={
								setOffthreadVideoCacheSizeInBytes
							}
							enableMultiProcessOnLinux={multiProcessOnLinux}
							setChromiumMultiProcessOnLinux={setChromiumMultiProcessOnLinux}
							codec={codec}
							userAgent={userAgent}
							setUserAgent={setUserAgent}
							setBeep={setBeepOnFinish}
							beep={beepOnFinish}
							repro={repro}
							setRepro={setRepro}
							hardwareAcceleration={hardwareAcceleration}
							setHardwareAcceleration={setHardwareAcceleration}
							chromeModeOption={chromeMode}
							setChromeModeOption={setChromeMode}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const RenderModalWithLoader: React.FC<RenderModalProps> = (props) => {
	return (
		<DismissableModal>
			<ResolveCompositionBeforeModal compositionId={props.compositionId}>
				<RenderModal {...props} />
			</ResolveCompositionBeforeModal>
		</DismissableModal>
	);
};
