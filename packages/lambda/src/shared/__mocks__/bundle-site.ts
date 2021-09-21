import {bundle} from '@remotion/bundler';

export const bundleSite: typeof bundle = (entry: string) => {
	if (entry === 'first') {
		return Promise.resolve('/path/to/bundle-1');
	}

	if (entry === 'second') {
		return Promise.resolve('/path/to/bundle-2');
	}

	throw new Error('unknown entry');
};
