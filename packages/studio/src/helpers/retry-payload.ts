import type {
	AudioCodec,
	Codec,
	ColorSpace,
	PixelFormat,
	ProResProfile,
	X264Preset,
} from '@remotion/renderer';
import type {RenderJob} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderModalState} from '../state/modals';

export const makeRetryPayload = (job: RenderJob): RenderModalState => {
	const defaults = window.remotion_renderDefaults;
	if (!defaults) {
		throw new Error('defaults not set');
	}

	if (job.type === 'still') {
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialFrame: job.frame,
			initialStillImageFormat: job.imageFormat,
			initialVideoImageFormat: defaults.videoImageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
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
			initialDelayRenderTimeout: job.delayRenderTimeout,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			defaultProps: NoReactInternals.deserializeJSONWithCustomFields(
				job.serializedInputPropsWithCustomSchema,
			),
			inFrameMark: null,
			outFrameMark: null,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialColorSpace: defaults.colorSpace as ColorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: defaults.codec as Codec,
			initialEncodingBufferSize: defaults.encodingBufferSize,
			initialEncodingMaxRate: defaults.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: defaults.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'still',
			initialHardwareAcceleration: defaults.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
		};
	}

	if (job.type === 'sequence') {
		return {
			type: 'render',
			initialFrame: 0,
			compositionId: job.compositionId,
			initialVideoImageFormat: defaults.videoImageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
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
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			defaultProps: NoReactInternals.deserializeJSONWithCustomFields(
				job.serializedInputPropsWithCustomSchema,
			),
			initialStillImageFormat: defaults.stillImageFormat,
			inFrameMark: job.startFrame,
			outFrameMark: job.endFrame,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialColorSpace: defaults.colorSpace as ColorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: defaults.codec as Codec,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEncodingBufferSize: defaults.encodingBufferSize,
			initialEncodingMaxRate: defaults.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: defaults.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'sequence',
			initialHardwareAcceleration: defaults.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
		};
	}

	if (job.type === 'video') {
		return {
			type: 'render',
			compositionId: job.compositionId,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: job.imageFormat,
			initialJpegQuality: job.jpegQuality ?? defaults.jpegQuality,
			initialScale: job.scale,
			initialLogLevel: job.logLevel,
			initialFrame: 0,
			initialConcurrency: job.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: job.muted,
			initialEnforceAudioTrack: job.enforceAudioTrack,
			initialProResProfile:
				job.proResProfile ?? (defaults.proResProfile as ProResProfile),
			initialx264Preset: job.x264Preset ?? (defaults.x264Preset as X264Preset),
			initialPixelFormat: job.pixelFormat,
			initialAudioBitrate: job.audioBitrate,
			initialVideoBitrate: job.videoBitrate,
			initialEveryNthFrame: job.everyNthFrame,
			initialNumberOfGifLoops: job.numberOfGifLoops,
			initialDelayRenderTimeout: job.delayRenderTimeout,
			initialEnvVariables: job.envVariables,
			initialDisableWebSecurity: job.chromiumOptions.disableWebSecurity,
			initialOpenGlRenderer: job.chromiumOptions.gl,
			initialIgnoreCertificateErrors:
				job.chromiumOptions.ignoreCertificateErrors,
			defaultProps: NoReactInternals.deserializeJSONWithCustomFields(
				job.serializedInputPropsWithCustomSchema,
			),
			inFrameMark: job.startFrame,
			outFrameMark: job.endFrame,
			initialOffthreadVideoCacheSizeInBytes: job.offthreadVideoCacheSizeInBytes,
			initialColorSpace: job.colorSpace,
			initialMultiProcessOnLinux: job.multiProcessOnLinux,
			defaultConfigurationVideoCodec: job.codec,
			defaultConfigurationAudioCodec: job.audioCodec,
			initialEncodingBufferSize: job.encodingBufferSize,
			initialEncodingMaxRate: job.encodingMaxRate,
			initialUserAgent: job.chromiumOptions.userAgent,
			initialBeep: job.beepOnFinish,
			initialRepro: job.repro,
			initialForSeamlessAacConcatenation: job.forSeamlessAacConcatenation,
			defaulMetadata: job.metadata,
			renderTypeOfLastRender: 'video',
			initialHardwareAcceleration: job.hardwareAcceleration,
			initialChromeMode: job.chromeMode,
		};
	}

	throw new Error(`Job ${JSON.stringify(job)} Not implemented`);
};
