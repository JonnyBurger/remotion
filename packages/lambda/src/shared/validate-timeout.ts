import {MAX_TIMEOUT, MIN_TIMEOUT} from './constants';

export const validateTimeout = (timeoutInSeconds: unknown) => {
	if (typeof timeoutInSeconds !== 'number') {
		throw new TypeError(
			`parameter 'timeoutInSeconds' must be a number, but got a ${typeof timeoutInSeconds}`
		);
	}

	if (Number.isNaN(timeoutInSeconds)) {
		throw new TypeError(`parameter 'timeoutInSeconds' must not be NaN, but is`);
	}

	if (!Number.isFinite(timeoutInSeconds)) {
		throw new TypeError(
			`parameter 'timeoutInSeconds' must be finite, but is ${timeoutInSeconds}`
		);
	}

	if (timeoutInSeconds < MIN_TIMEOUT || timeoutInSeconds > MAX_TIMEOUT) {
		throw new TypeError(
			`parameter 'timeoutInSeconds' must be between ${MIN_TIMEOUT} and ${MAX_TIMEOUT}, but got ${timeoutInSeconds}`
		);
	}

	if (timeoutInSeconds % 1 !== 0) {
		throw new TypeError(
			`parameter 'timeoutInSeconds' must be an integer but got ${timeoutInSeconds}`
		);
	}
};
