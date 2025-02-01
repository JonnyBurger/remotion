import React, {useContext} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {ModalsContext} from '../state/modals';
import {InstallPackageModal} from './InstallPackage';
import {DeleteComposition} from './NewComposition/DeleteComposition';
import {DuplicateComposition} from './NewComposition/DuplicateComposition';
import {RenameComposition} from './NewComposition/RenameComposition';
import QuickSwitcher from './QuickSwitcher/QuickSwitcher';
import {RenderModalWithLoader} from './RenderModal/RenderModal';
import {RenderStatusModal} from './RenderModal/RenderStatusModal';
import {UpdateModal} from './UpdateModal/UpdateModal';

export const Modals: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {selectedModal: modalContextType} = useContext(ModalsContext);
	const canRender =
		useContext(StudioServerConnectionCtx).previewServerState.type ===
		'connected';

	return (
		<>
			{modalContextType && modalContextType.type === 'duplicate-comp' && (
				<DuplicateComposition
					compositionType={modalContextType.compositionType}
					compositionId={modalContextType.compositionId}
				/>
			)}
			{modalContextType && modalContextType.type === 'delete-comp' && (
				<DeleteComposition compositionId={modalContextType.compositionId} />
			)}
			{modalContextType && modalContextType.type === 'rename-comp' && (
				<RenameComposition compositionId={modalContextType.compositionId} />
			)}

			{modalContextType && canRender && modalContextType.type === 'render' && (
				<RenderModalWithLoader
					initialFrame={modalContextType.initialFrame}
					compositionId={modalContextType.compositionId}
					initialVideoImageFormat={modalContextType.initialVideoImageFormat}
					initialJpegQuality={modalContextType.initialJpegQuality}
					initialScale={modalContextType.initialScale}
					initialLogLevel={modalContextType.initialLogLevel}
					initialOffthreadVideoCacheSizeInBytes={
						modalContextType.initialOffthreadVideoCacheSizeInBytes
					}
					initialConcurrency={modalContextType.initialConcurrency}
					maxConcurrency={modalContextType.maxConcurrency}
					minConcurrency={modalContextType.minConcurrency}
					initialStillImageFormat={modalContextType.initialStillImageFormat}
					initialMuted={modalContextType.initialMuted}
					initialEnforceAudioTrack={modalContextType.initialEnforceAudioTrack}
					initialProResProfile={modalContextType.initialProResProfile}
					initialx264Preset={modalContextType.initialx264Preset}
					initialPixelFormat={modalContextType.initialPixelFormat}
					initialAudioBitrate={modalContextType.initialAudioBitrate}
					initialVideoBitrate={modalContextType.initialVideoBitrate}
					initialEveryNthFrame={modalContextType.initialEveryNthFrame}
					initialNumberOfGifLoops={modalContextType.initialNumberOfGifLoops}
					initialDelayRenderTimeout={modalContextType.initialDelayRenderTimeout}
					initialEnvVariables={modalContextType.initialEnvVariables}
					initialDisableWebSecurity={modalContextType.initialDisableWebSecurity}
					initialGl={modalContextType.initialOpenGlRenderer}
					initialIgnoreCertificateErrors={
						modalContextType.initialIgnoreCertificateErrors
					}
					initialEncodingBufferSize={modalContextType.initialEncodingBufferSize}
					initialEncodingMaxRate={modalContextType.initialEncodingMaxRate}
					initialUserAgent={modalContextType.initialUserAgent}
					initialColorSpace={modalContextType.initialColorSpace}
					initialMultiProcessOnLinux={
						modalContextType.initialMultiProcessOnLinux
					}
					initialRepro={modalContextType.initialRepro}
					initialBeep={modalContextType.initialBeep}
					initialForSeamlessAacConcatenation={
						modalContextType.initialForSeamlessAacConcatenation
					}
					defaultProps={modalContextType.defaultProps}
					inFrameMark={modalContextType.inFrameMark}
					outFrameMark={modalContextType.outFrameMark}
					defaultConfigurationAudioCodec={
						modalContextType.defaultConfigurationAudioCodec
					}
					defaultConfigurationVideoCodec={
						modalContextType.defaultConfigurationVideoCodec
					}
					renderTypeOfLastRender={modalContextType.renderTypeOfLastRender}
					defaultMetadata={modalContextType.defaulMetadata}
					initialHardwareAcceleration={
						modalContextType.initialHardwareAcceleration
					}
					initialChromeMode={modalContextType.initialChromeMode}
				/>
			)}

			{modalContextType &&
				canRender &&
				modalContextType.type === 'render-progress' && (
					<RenderStatusModal jobId={modalContextType.jobId} />
				)}

			{modalContextType && modalContextType.type === 'update' && (
				<UpdateModal
					info={modalContextType.info}
					knownBugs={modalContextType.knownBugs}
				/>
			)}
			{modalContextType && modalContextType.type === 'install-packages' && (
				<InstallPackageModal packageManager={modalContextType.packageManager} />
			)}

			{modalContextType && modalContextType.type === 'quick-switcher' && (
				<QuickSwitcher
					readOnlyStudio={readOnlyStudio}
					invocationTimestamp={modalContextType.invocationTimestamp}
					initialMode={modalContextType.mode}
				/>
			)}
		</>
	);
};
