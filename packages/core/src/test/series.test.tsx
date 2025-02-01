import {expect, test} from 'bun:test';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import {Series} from '../series/index.js';
import {TimelineContext} from '../timeline-position-state.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const First = () => {
	const frame = useCurrentFrame();
	return <div>{'first ' + frame}</div>;
};

const Second = () => {
	const frame = useCurrentFrame();
	return <div>{'second ' + frame}</div>;
};

const Third = () => {
	const frame = useCurrentFrame();
	return <div>{'third ' + frame}</div>;
};

const Fourth = () => {
	const frame = useCurrentFrame();
	return <div>{'fourth ' + frame}</div>;
};

const renderForFrame = (frame: number, markup: React.ReactNode) => {
	return renderToString(
		<CanUseRemotionHooksProvider>
			<TimelineContext.Provider
				value={{
					rootId: '',
					frame: {
						'my-comp': frame,
					},
					playing: false,
					imperativePlaying: {
						current: false,
					},
					playbackRate: 1,
					setPlaybackRate: () => {
						throw new Error('playback rate');
					},
					audioAndVideoTags: {current: []},
				}}
			>
				{markup}
			</TimelineContext.Provider>
		</CanUseRemotionHooksProvider>,
	);
};

test('Basic series test', () => {
	const outerHTML = renderForFrame(
		10,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5}>
					<First />
				</Series.Sequence>
				<Series.Sequence durationInFrames={5}>
					<Second />
				</Series.Sequence>
				<Series.Sequence durationInFrames={5}>
					<Third />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>third 0</div></div></div>',
	);
});

test('Should support fragments', () => {
	const outerHtml = renderForFrame(
		10,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5}>
					<First />
				</Series.Sequence>
				<>
					<Series.Sequence key="0" durationInFrames={5}>
						<Second />
					</Series.Sequence>
					<>
						<Series.Sequence key="1" durationInFrames={5}>
							<Third />
						</Series.Sequence>
						<Series.Sequence key="2" durationInFrames={5}>
							<Fourth />
						</Series.Sequence>
					</>
				</>
			</Series>
		</WrapSequenceContext>,
	);

	expect(outerHtml).not.toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>second 1</div></div></div>',
	);
});
test('Should not allow foreign elements', () => {
	expect(() => {
		renderForFrame(
			0,
			<WrapSequenceContext>
				<Series>
					<First />
				</Series>
			</WrapSequenceContext>,
		);
	}).toThrow(/only accepts a/);
});
test('Should allow layout prop', () => {
	const outerHTML = renderForFrame(
		0,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={1}>
					<First />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>first 0</div></div></div>',
	);

	const outerHTML2 = renderForFrame(
		0,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={1} layout="none">
					<First />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML2).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>first 0</div></div>',
	);
});
test('Should render nothing after the end', () => {
	const outerHTML = renderForFrame(
		10,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={1}>
					<First />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"></div>',
	);
});
test('Should throw if invalid or no duration provided', () => {
	expect(() => {
		renderForFrame(
			10,
			<Series>
				<Series.Sequence durationInFrames={NaN}>
					<First />
				</Series.Sequence>
			</Series>,
		);
	}).toThrow(
		/The "durationInFrames" prop of a <Series.Sequence \/> component must be finite, but got NaN./,
	);
	expect(() => {
		renderForFrame(
			10,
			<Series>
				{/**
				 * @ts-expect-error */}
				<Series.Sequence>
					<First />
				</Series.Sequence>
			</Series>,
		);
	}).toThrow(
		/The "durationInFrames" prop of a <Series.Sequence \/> component is missing./,
	);
});
test('Should allow whitespace', () => {
	const outerHtml = renderForFrame(
		11,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={10}>
					<First />
				</Series.Sequence>{' '}
				<Series.Sequence durationInFrames={10}>
					<Second />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);

	expect(outerHtml).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>second 1</div></div></div>',
	);
});
test('Handle empty Series.Sequence', () => {
	expect(() =>
		renderForFrame(
			11,
			<Series>
				<Series.Sequence durationInFrames={10}>
					<First />
				</Series.Sequence>
				<Series.Sequence durationInFrames={10} />
			</Series>,
		),
	).toThrow(
		/A <Series.Sequence \/> component \(index = 1, duration = 10\) was detected to not have any children\. Delete it to fix this error\./,
	);
});

test('Should allow negative overlap prop', () => {
	const outerHTML = renderForFrame(
		4,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5} layout="none">
					<First />
				</Series.Sequence>
				<Series.Sequence offset={-1} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>first 4</div><div>second 0</div></div>',
	);
});

test('Should allow positive overlap prop', () => {
	const outerHTML = renderForFrame(
		5,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5} layout="none">
					<First />
				</Series.Sequence>
				<Series.Sequence offset={1} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"></div>',
	);
});

test('Should disallow NaN as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={NaN} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>,
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must not be NaN, but got NaN \(index = 0, duration = 5\)\./,
	);
});

test('Should disallow Infinity as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={Infinity} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>,
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must be finite, but got Infinity \(index = 0, duration = 5\)\./,
	);
});

test('Should disallow non-integer numbers as offset prop', () => {
	expect(() => {
		renderForFrame(
			9,
			<Series>
				<Series.Sequence offset={Math.PI} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
			</Series>,
		);
	}).toThrow(
		/The "offset" property of a <Series.Sequence \/> must be finite, but got 3.141592653589793 \(index = 0, duration = 5\)\./,
	);
});

test('Should cascade negative offset props', () => {
	const outerHTML = renderForFrame(
		9,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5} layout="none">
					<First />
				</Series.Sequence>
				<Series.Sequence offset={-1} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
				<Series.Sequence layout="none" durationInFrames={5}>
					<Third />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>third 0</div></div>',
	);
});

test('Should cascade positive offset props', () => {
	const outerHTML = renderForFrame(
		11,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5} layout="none">
					<First />
				</Series.Sequence>
				<Series.Sequence offset={1} layout="none" durationInFrames={5}>
					<Second />
				</Series.Sequence>
				<Series.Sequence layout="none" durationInFrames={5}>
					<Third />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>third 0</div></div>',
	);
});

test('Allow durationInFrames as Infinity for last Series.Sequence', () => {
	const outerHTML = renderForFrame(
		10,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5}>
					<First />
				</Series.Sequence>
				<Series.Sequence durationInFrames={5}>
					<Second />
				</Series.Sequence>
				<Series.Sequence durationInFrames={Infinity}>
					<Third />
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
	expect(outerHTML).toBe(
		'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex"><div>third 0</div></div></div>',
	);
});

test('Disallow durationInFrames as Infinity for first n-1 Series.Sequence', () => {
	expect(() => {
		renderForFrame(
			10,
			<WrapSequenceContext>
				<Series>
					<Series.Sequence durationInFrames={5}>
						<First />
					</Series.Sequence>
					<Series.Sequence durationInFrames={Infinity}>
						<Second />
					</Series.Sequence>
					<Series.Sequence durationInFrames={5}>
						<Third />
					</Series.Sequence>
				</Series>
			</WrapSequenceContext>,
		);
	}).toThrow(
		/The "durationInFrames" prop of a <Series.Sequence \/> component must be finite, but got Infinity\./,
	);
});

test('Disallow Series.Sequence to not be inside Series', () => {
	expect(() => {
		renderForFrame(
			10,
			<WrapSequenceContext>
				<Series.Sequence durationInFrames={5}>
					<First />
				</Series.Sequence>
			</WrapSequenceContext>,
		);
	}).toThrow(/This component must be inside a <Series \/> component\./);
});

test('Disallow Series.Sequence to not be inside Series 2', () => {
	expect(() => {
		renderForFrame(
			10,
			<WrapSequenceContext>
				<Series>
					<Series.Sequence durationInFrames={15}>
						<Series.Sequence durationInFrames={10} />
					</Series.Sequence>
				</Series>
			</WrapSequenceContext>,
		);
	}).toThrow(/This component must be inside a <Series \/> component\./);
});

test('Allow Series to be nested', () => {
	renderForFrame(
		10,
		<WrapSequenceContext>
			<Series>
				<Series.Sequence durationInFrames={5}>
					<AbsoluteFill>
						<Series>
							<Series.Sequence durationInFrames={10} />
						</Series>
					</AbsoluteFill>
				</Series.Sequence>
			</Series>
		</WrapSequenceContext>,
	);
});
