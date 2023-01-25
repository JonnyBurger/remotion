import type {Instruction} from './instructions';
import {serializeInstructions} from './instructions';
import type {ShapeInfo} from './shape-info';

export type MakeCircleProps = {
	radius: number;
};

export const makeCircle = ({radius}: MakeCircleProps): ShapeInfo => {
	const instructions: Instruction[] = [
		{
			type: 'M',
			x: radius,
			y: radius,
		},
		{
			type: 'm',
			x: -radius,
			y: 0,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			x: radius * 2,
			y: 0,
		},
		{
			type: 'a',
			rx: radius,
			ry: radius,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			x: -radius * 2,
			y: 0,
		},
	];

	const path = serializeInstructions(instructions);

	return {
		height: radius * 2,
		width: radius * 2,
		path,
		instructions,
		transformOrigin: `${radius} ${radius}`,
	};
};
