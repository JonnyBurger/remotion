import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {SharedAudioContextProvider} from './audio/shared-audio-tags';
import {
	CompositionManager,
	CompositionManagerContext,
	TAsset,
	TCaption,
	TComposition,
	TSequence,
} from './CompositionManager';
import {NonceContext, TNonceContext} from './nonce';
import {random} from './random';
import {continueRender, delayRender} from './ready-manager';
import {
	SetTimelineContext,
	SetTimelineContextValue,
	TimelineContext,
	TimelineContextValue,
} from './timeline-position-state';

export const RemotionRoot: React.FC = ({children}) => {
	// Wontfix, expected to have
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [compositions, setCompositions] = useState<TComposition<any>[]>([]);
	const [currentComposition, setCurrentComposition] = useState<string | null>(
		null
	);
	const [remotionRootId] = useState(() => String(random(null)));
	const [sequences, setSequences] = useState<TSequence[]>([]);
	const [assets, setAssets] = useState<TAsset[]>([]);
	const [captions, setCaptions] = useState<TCaption[]>([]);
	const [frame, setFrame] = useState<number>(window.remotion_initialFrame ?? 0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [fastRefreshes, setFastRefreshes] = useState(0);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_setFrame = (f: number) => {
				const id = delayRender();
				setFrame(f);
				requestAnimationFrame(() => continueRender(id));
			};

			window.remotion_isPlayer = false;
		}
	}, []);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectAssets = () => {
				setAssets([]); // clear assets at next render
				return assets;
			};
		}
	}, [assets]);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectCaptions = () => {
				setCaptions([]); // clear captions at next render
				return captions;
			};
		}
	}, [captions]);

	const registerComposition = useCallback(<T,>(comp: TComposition<T>) => {
		setCompositions((comps) => {
			if (comps.find((c) => c.id === comp.id)) {
				throw new Error(
					`Multiple composition with id ${comp.id} are registered.`
				);
			}

			return [...comps, comp].slice().sort((a, b) => a.nonce - b.nonce);
		});
	}, []);

	const registerSequence = useCallback((seq: TSequence) => {
		setSequences((seqs) => {
			return [...seqs, seq];
		});
	}, []);

	const unregisterComposition = useCallback((id: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.id !== id);
		});
	}, []);

	const unregisterSequence = useCallback((seq: string) => {
		setSequences((seqs) => seqs.filter((s) => s.id !== seq));
	}, []);

	const registerAsset = useCallback((asset: TAsset) => {
		setAssets((assts) => {
			return [...assts, asset];
		});
	}, []);
	const unregisterAsset = useCallback((id: string) => {
		setAssets((assts) => {
			return assts.filter((a) => a.id !== id);
		});
	}, []);

	const registerCaption = useCallback((caption: TCaption) => {
		setCaptions((capts) => capts.concat(caption));
	}, []);
	const unregisterCaption = useCallback((id: string) => {
		setCaptions((capts) => capts.filter((a) => a.id !== id));
	}, []);

	const contextValue = useMemo((): CompositionManagerContext => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
			currentComposition,
			setCurrentComposition,
			registerSequence,
			unregisterSequence,
			registerAsset,
			unregisterAsset,
			registerCaption,
			unregisterCaption,
			sequences,
			assets,
			captions,
		};
	}, [
		compositions,
		currentComposition,
		registerComposition,
		registerSequence,
		unregisterComposition,
		unregisterSequence,
		registerAsset,
		unregisterAsset,
		registerCaption,
		unregisterCaption,
		sequences,
		assets,
		captions,
	]);

	const timelineContextValue = useMemo((): TimelineContextValue => {
		return {
			frame,
			playing,
			rootId: remotionRootId,
		};
	}, [frame, playing, remotionRootId]);

	const setTimelineContextValue = useMemo((): SetTimelineContextValue => {
		return {
			setFrame,
			setPlaying,
		};
	}, []);

	const nonceContext = useMemo((): TNonceContext => {
		let counter = 0;
		return {
			getNonce: () => counter++,
			fastRefreshes,
		};
	}, [fastRefreshes]);

	useEffect(() => {
		if (module.hot) {
			module.hot.addStatusHandler((status) => {
				if (status === 'idle') {
					setFastRefreshes((i) => i + 1);
				}
			});
		}
	}, []);

	return (
		<NonceContext.Provider value={nonceContext}>
			<TimelineContext.Provider value={timelineContextValue}>
				<SetTimelineContext.Provider value={setTimelineContextValue}>
					<CompositionManager.Provider value={contextValue}>
						<SharedAudioContextProvider
							// In the preview, which is mostly played on Desktop, we opt out of the autoplay policy fix as described in https://github.com/remotion-dev/remotion/pull/554, as it mostly applies to mobile.
							numberOfAudioTags={0}
						>
							{children}
						</SharedAudioContextProvider>
					</CompositionManager.Provider>
				</SetTimelineContext.Provider>
			</TimelineContext.Provider>
		</NonceContext.Provider>
	);
};
