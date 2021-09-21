import {bundleLambda as original} from '../bundle-lambda';

export const bundleLambda: typeof original = async () => {
	return Promise.resolve('/path/to/functionbundle');
};
