import {useCurrentFrame} from 'remotion';
import './index.css';

export const HelloWorld = () => {
	const frame = useCurrentFrame();

	return (
		<div id='scene' style={{flex: 1, backgroundColor: 'gray'}}>
			<div id='hello' style={{transform:`translate(${frame%300-150}px,${frame/300}px)`}}>
				Hello World!
			</div>
		</div>
	);
};
