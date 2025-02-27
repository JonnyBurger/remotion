import {clockWipe} from '@remotion/transitions/clock-wipe';
import {fade} from '@remotion/transitions/fade';
import {flip} from '@remotion/transitions/flip';
import {none} from '@remotion/transitions/none';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import React from 'react';
import {PresentationPreview} from '../../transitions/previews';
import {Grid} from '../Grid';
import {TOCItem} from '../TOCItem';
import {ProLabel} from '../pro-label';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

export const presentationCompositionWidth = 540;
export const presentationCompositionHeight = 280;

export const Presentations: React.FC<{
	readonly apisOnly: boolean;
}> = ({apisOnly}) => {
	return (
		<Grid>
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/presentations">
					<strong>{'Overview'}</strong>
					<div>List of available presentations</div>
				</TOCItem>
			)}
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/presentations/custom">
					<strong>Custom presentations</strong>
					<div>Implement your own effect</div>
				</TOCItem>
			)}
			<TOCItem link="/docs/transitions/presentations/fade">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={fade()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'fade()'}</code>
						</strong>
						<div>Animate the opacity of the scenes</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/slide">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={slide()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'slide()'}</code>
						</strong>
						<div>Slide in and push out the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/wipe">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={wipe()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'wipe()'}</code>
						</strong>
						<div>Slide over the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/flip">
				<div style={row}>
					<PresentationPreview durationRestThreshold={0.001} effect={flip()} />
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'flip()'}</code>
						</strong>
						<div>Rotate the previous scene</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/clock-wipe">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={clockWipe({
							width: presentationCompositionWidth,
							height: presentationCompositionHeight,
						})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'clockWipe()'}</code>
						</strong>
						<div>Reveal the new scene in a circular movement</div>
					</div>
				</div>
			</TOCItem>

			<TOCItem link="/docs/transitions/presentations/cube">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={cube({
							direction: 'from-left',
						})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'cube()'}</code>
						</strong>
						<ProLabel />
						<div>Rotate both scenes with 3D perspective</div>
					</div>
				</div>
			</TOCItem>
			<TOCItem link="/docs/transitions/presentations/none">
				<div style={row}>
					<PresentationPreview
						durationRestThreshold={0.001}
						effect={none({})}
					/>
					<div style={{flex: 1, marginLeft: 10}}>
						<strong>
							<code>{'none()'}</code>
						</strong>
						<div>Have no visual effect.</div>
					</div>
				</div>
			</TOCItem>
			{apisOnly ? null : (
				<TOCItem link="/docs/transitions/audio-transitions">
					<div style={row}>
						<div style={{flex: 1}}>
							<strong>Audio transitions</strong>
							<div>Add a sound effect to a transition</div>
						</div>
					</div>
				</TOCItem>
			)}
		</Grid>
	);
};
