import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {LooseAnyComponent} from '../any-component';
import {Internals} from '../internals';
import {Video} from '../video';
import {expectToThrow} from './expect-to-throw';

const Wrapper: React.FC = ({children}) => {
	const compositions = useContext(Internals.CompositionManager);
	return (
		<Internals.RemotionRoot>
			<Internals.CompositionManager.Provider
				// eslint-disable-next-line react/jsx-no-constructed-context-values
				value={{
					...compositions,
					compositions: [
						{
							height: 1080,
							width: 1080,
							fps: 30,
							durationInFrames: 30,
							id: 'markup',
							nonce: 0,
							component: React.lazy(() =>
								Promise.resolve({
									default: (() => null) as LooseAnyComponent<unknown>,
								})
							),
						},
					],
					currentComposition: 'markup',
				}}
			>
				{children}
			</Internals.CompositionManager.Provider>
		</Internals.RemotionRoot>
	);
};

describe('Render correctly with props', () => {
	test('It should render Video without startFrom / endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with startFrom props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" startFrom={10} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with children source', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video>
						<source src="test-path-1" />
						<source src="test-path-2" />
					</Video>
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" endAt={10} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should render Video with startFrom and endAt props', () => {
		expect(() =>
			render(
				<Wrapper>
					<Video src="test" startFrom={10} endAt={15} />
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should throw if videoConfig/Wrapper is missing', () => {
		expectToThrow(
			() => render(<Video startFrom={10} endAt={15} />),
			/No video config found/
		);
	});
});
