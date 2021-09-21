const validOptions = ['tab', 'browser'] as const;

export type ConcurrentMode = typeof validOptions[number];

let currentConcurrentMode: ConcurrentMode = 'tab';

export const setConcurrentMode = (mode: ConcurrentMode) => {
	if (!validOptions.includes(mode)) {
		throw new TypeError(`Value ${mode} is not valid as a concurrent mode.`);
	}

	currentConcurrentMode = mode;
};

export const getConcurrentMode = () => {
	return currentConcurrentMode;
};
