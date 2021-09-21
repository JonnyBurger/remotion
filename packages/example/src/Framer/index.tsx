import {random, useCurrentFrame} from 'remotion';

export function selectColor(color: string, frame: number): number {
	return Math.floor((random(`${color}-${frame}`) * 255) % 255);
}

export const Framer: React.FC = () => {
	const frame = useCurrentFrame();

	const red = selectColor('red', frame);
	const green = selectColor('green', frame);
	const blue = selectColor('blue', frame);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				background: 'white',
				flex: 1,
				borderTop: `100px solid rgb(${red}, ${green}, ${blue})`,
				paddingBottom: 100,
			}}
		>
			<h1 style={{fontSize: 120}}>{frame} 😁</h1>
		</div>
	);
};
