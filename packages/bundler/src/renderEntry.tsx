import React, {Suspense, useContext, useEffect, useMemo} from 'react';
import {render} from 'react-dom';
import {
	continueRender,
	delayRender,
	getInputProps,
	Internals,
	TComposition,
} from 'remotion';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null));

const Root = Internals.getRoot();

if (!Root) {
	throw new Error('Root has not been registered.');
}

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender();
		return () => continueRender(fallback);
	}, []);
	return null;
};

const inputProps = getInputProps();
const handle = delayRender();

const GetVideo = () => {
	const video = Internals.useVideo();
	const compositions = useContext(Internals.CompositionManager);

	useEffect(() => {
		if (Internals.getIsEvaluation()) {
			return;
		}

		if (!video && compositions.compositions.length > 0) {
			compositions.setCurrentComposition(
				(compositions.compositions.find(
					(c) => c.id === Internals.getCompositionName()
				) as TComposition)?.id ?? null
			);
		}
	}, [compositions, compositions.compositions, video]);

	const style = useMemo(() => {
		if (!video) {
			return {};
		}

		return {
			width: video.width,
			height: video.height,
			display: 'flex',
			backgroundColor: 'transparent',
		};
	}, [video]);

	useEffect(() => {
		if (video) {
			continueRender(handle);
		}
	}, [video]);

	if (!video) {
		return null;
	}

	const Component = video.component;

	return (
		<Suspense fallback={<Fallback />}>
			<div id="canvas" style={style}>
				{Component ? (
					<Component {...((video?.props as {}) ?? {})} {...inputProps} />
				) : null}
			</div>
		</Suspense>
	);
};

if (!Internals.isPlainIndex()) {
	render(
		<Internals.RemotionRoot>
			<Root />
			<GetVideo />
		</Internals.RemotionRoot>,
		document.getElementById('container')
	);
}
