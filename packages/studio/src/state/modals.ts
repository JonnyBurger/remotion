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
import type {PackageManager} from '@remotion/studio-shared';
import type React from 'react';
import {createContext} from 'react';
import type {CompType} from '../components/NewComposition/DuplicateComposition';
import type {QuickSwitcherMode} from '../components/QuickSwitcher/NoResults';
import type {RenderType} from '../components/RenderModal/RenderModalAdvanced';
import type {Bug, UpdateInfo} from '../components/UpdateCheck';

export type RenderModalState = {
	type: 'render';
	compositionId: string;
	initialFrame: number;
	initialStillImageFormat: StillImageFormat;
	initialVideoImageFormat: VideoImageFormat;
	initialJpegQuality: number;
	initialScale: number;
	initialLogLevel: LogLevel;
	initialConcurrency: number;
	initialMuted: boolean;
	initialEnforceAudioTrack: boolean;
	initialProResProfile: ProResProfile;
	initialx264Preset: X264Preset;
	initialPixelFormat: PixelFormat;
	initialVideoBitrate: string | null;
	initialAudioBitrate: string | null;
	initialEveryNthFrame: number;
	initialNumberOfGifLoops: number | null;
	initialDelayRenderTimeout: number;
	initialEnvVariables: Record<string, string>;
	initialDisableWebSecurity: boolean;
	initialOpenGlRenderer: OpenGlRenderer | null;
	initialIgnoreCertificateErrors: boolean;
	initialOffthreadVideoCacheSizeInBytes: number | null;
	initialColorSpace: ColorSpace;
	initialMultiProcessOnLinux: boolean;
	initialUserAgent: string | null;
	initialEncodingMaxRate: string | null;
	initialEncodingBufferSize: string | null;
	initialForSeamlessAacConcatenation: boolean;
	initialHardwareAcceleration: HardwareAccelerationOption;
	initialBeep: boolean;
	initialRepro: boolean;
	initialChromeMode: ChromeMode;
	minConcurrency: number;
	maxConcurrency: number;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
	defaultConfigurationVideoCodec: Codec;
	defaultConfigurationAudioCodec: AudioCodec | null;
	renderTypeOfLastRender: RenderType | null;
	defaulMetadata: Record<string, string> | null;
};

export type ModalState =
	| {
			type: 'duplicate-comp';
			compositionId: string;
			compositionType: CompType;
	  }
	| {
			type: 'delete-comp';
			compositionId: string;
	  }
	| {
			type: 'rename-comp';
			compositionId: string;
	  }
	| RenderModalState
	| {
			type: 'render-progress';
			jobId: string;
	  }
	| {
			type: 'update';
			info: UpdateInfo;
			knownBugs: Bug[];
	  }
	| {
			type: 'install-packages';
			packageManager: PackageManager;
	  }
	| {
			type: 'quick-switcher';
			mode: QuickSwitcherMode;
			invocationTimestamp: number;
	  };

export type ModalContextType = {
	selectedModal: ModalState | null;
	setSelectedModal: React.Dispatch<React.SetStateAction<ModalState | null>>;
};

export const ModalsContext = createContext<ModalContextType>({
	selectedModal: null,
	setSelectedModal: () => undefined,
});
