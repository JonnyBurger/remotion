import type {Constructed} from './helpers/construct';
import {construct} from './helpers/construct';

type InstructionAtLength = {
	index: number;
	lengthIntoInstruction: number;
};

export const getInstructionIndexAtLengthFromConstructed = (
	constructed: Constructed,
	fractionLength: number,
): InstructionAtLength => {
	if (fractionLength < 0) {
		throw new Error('Length less than 0 was passed');
	}

	if (fractionLength > constructed.totalLength) {
		throw new Error(
			`Length greater than total length was passed. Length: ${fractionLength}, total length: ${constructed.totalLength}`,
		);
	}

	let index = constructed.partialLengths.length - 1;

	while (constructed.partialLengths[index] >= fractionLength && index > 0) {
		index--;
	}

	return {
		lengthIntoInstruction: fractionLength - constructed.partialLengths[index],
		index,
	};
};

/*
 * @description Gets the index of the instruction and the part length into the instruction at a specified length along an SVG path.
 * @see [Documentation](https://www.remotion.dev/docs/paths/get-instruction-index-at-length)
 */
export const getInstructionIndexAtLength = (
	path: string,
	length: number,
): InstructionAtLength => {
	const constructed = construct(path);
	if (length > constructed.totalLength) {
		throw new Error(
			`A length of ${length} was passed to getInstructionIndexAtLength() but the total length of the path is only ${constructed.totalLength}`,
		);
	}

	return getInstructionIndexAtLengthFromConstructed(constructed, length);
};
