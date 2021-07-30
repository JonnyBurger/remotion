import {PlayerInternals} from '@remotion/player';
import React, {useMemo, useState} from 'react';
import {
	Internals,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from 'remotion';
import styled from 'styled-components';
import {
	CheckerboardContext,
	loadCheckerboardOption,
} from '../state/checkerboard';
import {loadPreviewSizeOption, PreviewSizeContext} from '../state/preview-size';
import {
	loadRichTimelineOption,
	RichTimelineContext,
} from '../state/rich-timeline';
import {FramePersistor} from './FramePersistor';
import {SplitterContainer} from './Splitter/SplitterContainer';
import {SplitterElement} from './Splitter/SplitterElement';
import {SplitterHandle} from './Splitter/SplitterHandle';
import {Timeline} from './Timeline/Timeline';
import {TopPanel} from './TopPanel';
import {UpdateCheck} from './UpdateCheck';

const Background = styled.div`
	background: #222;
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	position: absolute;
`;

const Root = Internals.getRoot();

export const Editor: React.FC = () => {
	const [emitter] = useState(() => new PlayerInternals.PlayerEmitter());
	const [size, setSize] = useState(() => loadPreviewSizeOption());
	const [checkerboard, setCheckerboard] = useState(() =>
		loadCheckerboardOption()
	);
	const [richTimeline, setRichTimeline] = useState(() =>
		loadRichTimelineOption()
	);
	const [mediaMuted, setMediaMuted] = useState<boolean>(false);
	const [mediaVolume, setMediaVolume] = useState<number>(1);

	const previewSizeCtx = useMemo(() => {
		return {
			size,
			setSize,
		};
	}, [size]);
	const checkerboardCtx = useMemo(() => {
		return {
			checkerboard,
			setCheckerboard,
		};
	}, [checkerboard]);
	const richTimelineCtx = useMemo(() => {
		return {
			richTimeline,
			setRichTimeline,
		};
	}, [richTimeline]);

	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			mediaMuted,
			mediaVolume,
		};
	}, [mediaMuted, mediaVolume]);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setMediaMuted,
			setMediaVolume,
		};
	}, []);

	if (!Root) {
		throw new Error('Root has not been registered. ');
	}

	return (
		<RichTimelineContext.Provider value={richTimelineCtx}>
			<CheckerboardContext.Provider value={checkerboardCtx}>
				<PreviewSizeContext.Provider value={previewSizeCtx}>
					<Internals.MediaVolumeContext.Provider
						value={mediaVolumeContextValue}
					>
						<Internals.SetMediaVolumeContext.Provider
							value={setMediaVolumeContextValue}
						>
							<PlayerInternals.PlayerEventEmitterContext.Provider
								value={emitter}
							>
								<Background>
									<Root />
									<UpdateCheck />
									<FramePersistor />
									<SplitterContainer
										orientation="horizontal"
										id="top-to-bottom"
										maxFlex={0.9}
										minFlex={0.2}
										defaultFlex={0.75}
									>
										<SplitterElement type="flexer">
											<TopPanel />
										</SplitterElement>
										<SplitterHandle />
										<SplitterElement type="anti-flexer">
											<Timeline />
										</SplitterElement>
									</SplitterContainer>
								</Background>
							</PlayerInternals.PlayerEventEmitterContext.Provider>
						</Internals.SetMediaVolumeContext.Provider>
					</Internals.MediaVolumeContext.Provider>
				</PreviewSizeContext.Provider>
			</CheckerboardContext.Provider>
		</RichTimelineContext.Provider>
	);
};
