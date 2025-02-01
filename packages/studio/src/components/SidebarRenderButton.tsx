import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	X264Preset,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import type {AnyCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {useMobileLayout} from '../helpers/mobile-layout';
import {ThinRenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
import {SidebarContext} from '../state/sidebar';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';

export const SidebarRenderButton: React.FC<{
	readonly composition: AnyCompMetadata;
	readonly visible: boolean;
}> = ({composition, visible}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const isMobileLayout = useMobileLayout();

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 12,
			},
		};
	}, []);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {props} = useContext(Internals.EditorPropsContext);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			const defaults = window.remotion_renderDefaults;
			if (!defaults) {
				throw new Error('expected defaults');
			}

			e.stopPropagation();
			setSelectedModal({
				type: 'render',
				compositionId: composition.id,
				initialFrame: 0,
				initialVideoImageFormat: defaults.videoImageFormat,
				initialStillImageFormat: defaults.stillImageFormat,
				initialJpegQuality: defaults.jpegQuality,
				initialScale: defaults.scale,
				initialLogLevel: defaults.logLevel as LogLevel,
				initialConcurrency: defaults.concurrency,
				maxConcurrency: defaults.maxConcurrency,
				minConcurrency: defaults.minConcurrency,
				initialMuted: defaults.muted,
				initialEnforceAudioTrack: defaults.enforceAudioTrack,
				initialProResProfile: defaults.proResProfile as ProResProfile,
				initialx264Preset: defaults.x264Preset as X264Preset,
				initialPixelFormat: defaults.pixelFormat as PixelFormat,
				initialAudioBitrate: defaults.audioBitrate,
				initialVideoBitrate: defaults.videoBitrate,
				initialEveryNthFrame: defaults.everyNthFrame,
				initialNumberOfGifLoops: defaults.numberOfGifLoops,
				initialDelayRenderTimeout: defaults.delayRenderTimeout,
				defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec,
				initialEnvVariables: window.process.env as Record<string, string>,
				initialDisableWebSecurity: defaults.disableWebSecurity,
				initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
				initialOffthreadVideoCacheSizeInBytes:
					defaults.offthreadVideoCacheSizeInBytes,
				initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
				defaultProps: props[composition.id] ?? composition.defaultProps,
				inFrameMark: null,
				outFrameMark: null,
				initialColorSpace: defaults.colorSpace as ColorSpace,
				initialMultiProcessOnLinux: defaults.multiProcessOnLinux,
				defaultConfigurationVideoCodec: defaults.codec as Codec,
				initialEncodingBufferSize: defaults.encodingBufferSize,
				initialEncodingMaxRate: defaults.encodingMaxRate,
				initialUserAgent: defaults.userAgent,
				initialBeep: defaults.beepOnFinish,
				initialRepro: defaults.repro,
				initialForSeamlessAacConcatenation:
					defaults.forSeamlessAacConcatenation,
				renderTypeOfLastRender: null,
				defaulMetadata: defaults.metadata,
				initialHardwareAcceleration: defaults.hardwareAcceleration,
				initialChromeMode: defaults.chromeMode,
			});

			if (isMobileLayout) {
				setSidebarCollapsedState({left: 'collapsed', right: 'collapsed'});
			}
		},
		[
			composition.defaultProps,
			composition.id,
			isMobileLayout,
			props,
			setSelectedModal,
			setSidebarCollapsedState,
		],
	);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return <ThinRenderIcon fill={color} svgProps={iconStyle} />;
		},
		[iconStyle],
	);

	if (!visible || connectionStatus !== 'connected') {
		return null;
	}

	return <InlineAction renderAction={renderAction} onClick={onClick} />;
};
