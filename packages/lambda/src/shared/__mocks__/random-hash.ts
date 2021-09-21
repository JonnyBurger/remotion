import {randomHash as original} from '../random-hash';

export const randomHash: typeof original = () => {
	return 'abcdef';
};
