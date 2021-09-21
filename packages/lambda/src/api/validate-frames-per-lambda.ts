import {MINIMUM_FRAMES_PER_LAMBDA} from '../defaults';

export const validateFramesPerLambda = (
	framesPerLambda: number | undefined
) => {
	if (typeof framesPerLambda === 'undefined') {
		return;
	}

	if (typeof framesPerLambda !== 'number') {
		throw new TypeError(
			`"framesPerLambda" must be a number, but is ${typeof framesPerLambda}`
		);
	}

	if (Number.isNaN(framesPerLambda)) {
		throw new TypeError(`"framesPerLambda" must be a real number, but is NaN`);
	}

	if (!Number.isFinite(framesPerLambda)) {
		throw new TypeError(
			`"framesPerLambda" must be a finite number, but is ${framesPerLambda}`
		);
	}

	if (framesPerLambda % 1 !== 0) {
		throw new TypeError(
			`"framesPerLambda" must be an integer, but is ${framesPerLambda}`
		);
	}

	if (framesPerLambda < MINIMUM_FRAMES_PER_LAMBDA) {
		throw new TypeError(
			`"framesPerLambda" must be at least ${MINIMUM_FRAMES_PER_LAMBDA}, but is ${framesPerLambda}`
		);
	}
};
