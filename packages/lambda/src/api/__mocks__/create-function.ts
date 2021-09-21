import {CURRENT_VERSION} from '../../defaults';
import {createFunction as original} from '../create-function';
import {addFunction} from '../mock-functions';
import {isLayerEnsured} from './mock-layers';

export const createFunction: typeof original = async (input) => {
	if (!isLayerEnsured(input.region)) {
		throw new TypeError('did not ensure layer for ' + input.region);
	}

	addFunction(
		{
			functionName: input.functionName,
			memorySizeInMb: 1024,
			timeoutInSeconds: input.timeoutInSeconds,
			version: CURRENT_VERSION,
		},
		input.region
	);
	return Promise.resolve({
		FunctionName: input.functionName,
	});
};
