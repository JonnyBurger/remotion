import {ensureLambdaBinaries as original} from '../ensure-lambda-binaries';
import {ensureLayer} from './mock-layers';

export const ensureLambdaBinaries: typeof original = (region) => {
	ensureLayer(region);
	return Promise.resolve({
		layerArn: region,
	});
};
