import {MAX_MEMORY, MIN_MEMORY} from './constants';

export const validateMemorySize = (memorySizeInMb: unknown) => {
	if (typeof memorySizeInMb !== 'number') {
		throw new TypeError(
			`parameter 'memorySize' must be a number, got a ${typeof memorySizeInMb}`
		);
	}

	if (Number.isNaN(memorySizeInMb)) {
		throw new TypeError(`parameter 'memorySize' must not be NaN, but is`);
	}

	if (!Number.isFinite(memorySizeInMb)) {
		throw new TypeError(
			`parameter 'memorySizeInMb' must be finite, but is ${memorySizeInMb}`
		);
	}

	if (memorySizeInMb < MIN_MEMORY || memorySizeInMb > MAX_MEMORY) {
		throw new TypeError(
			`parameter 'memorySize' must be between ${MIN_MEMORY} and ${MAX_MEMORY}, but got ${memorySizeInMb}`
		);
	}

	if (memorySizeInMb % 1 !== 0) {
		throw new TypeError(
			`parameter 'memorySize' must be an integer but got ${memorySizeInMb}`
		);
	}
};
