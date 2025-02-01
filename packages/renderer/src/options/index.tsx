import {apiKeyOption} from './api-key';
import {audioBitrateOption} from './audio-bitrate';
import {audioCodecOption} from './audio-codec';
import {beepOnFinishOption} from './beep-on-finish';
import {binariesDirectoryOption} from './binaries-directory';
import {chromeModeOption} from './chrome-mode';
import {colorSpaceOption} from './color-space';
import {crfOption} from './crf';
import {deleteAfterOption} from './delete-after';
import {disableGitSourceOption} from './disable-git-source';
import {enableLambdaInsights} from './enable-lambda-insights';
import {enableMultiprocessOnLinuxOption} from './enable-multiprocess-on-linux';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {folderExpiryOption} from './folder-expiry';
import {forSeamlessAacConcatenationOption} from './for-seamless-aac-concatenation';
import {glOption} from './gl';
import {hardwareAccelerationOption} from './hardware-acceleration';
import {jpegQualityOption} from './jpeg-quality';
import {logLevelOption} from './log-level';
import {metadataOption} from './metadata';
import {mutedOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';
import {onBrowserDownloadOption} from './on-browser-download';
import type {AnyRemotionOption} from './option';
import {overwriteOption} from './overwrite';
import {preferLosslessAudioOption} from './prefer-lossless';
import {publicDirOption} from './public-dir';
import {publicPathOption} from './public-path';
import {reproOption} from './repro';
import {scaleOption} from './scale';
import {separateAudioOption} from './separate-audio';
import {throwIfSiteExistsOption} from './throw-if-site-exists';
import {delayRenderTimeoutInMillisecondsOption} from './timeout';
import {videoBitrateOption} from './video-bitrate';
import {videoCodecOption} from './video-codec';
import {webhookCustomDataOption} from './webhook-custom-data';
import {x264Option} from './x264-preset';

export const allOptions = {
	audioCodecOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
	audioBitrateOption,
	enforceAudioOption,
	mutedOption,
	videoCodecOption,
	offthreadVideoCacheSizeInBytesOption,
	webhookCustomDataOption,
	colorSpaceOption,
	deleteAfterOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	enableLambdaInsights,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	beepOnFinishOption,
	numberOfGifLoopsOption,
	reproOption,
	preferLosslessOption: preferLosslessAudioOption,
	x264Option,
	logLevelOption,
	delayRenderTimeoutInMillisecondsOption,
	overwriteOption,
	binariesDirectoryOption,
	forSeamlessAacConcatenationOption,
	separateAudioOption,
	publicPathOption,
	publicDirOption,
	onBrowserDownloadOption,
	throwIfSiteExistsOption,
	disableGitSourceOption,
	metadataOption,
	hardwareAccelerationOption,
	chromeModeOption,
	apiKeyOption,
};

export type AvailableOptions = keyof typeof allOptions;
export type TypeOfOption<Type> =
	Type extends AnyRemotionOption<infer X> ? X : never;
