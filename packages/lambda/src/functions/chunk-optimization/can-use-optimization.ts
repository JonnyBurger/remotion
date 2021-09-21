import {CURRENT_VERSION} from '../../defaults';
import {OptimizationProfile} from './types';

export const canUseOptimization = ({
	optimization,
	framesPerLambda,
	frameCount,
}: {
	optimization: OptimizationProfile | null;
	framesPerLambda: number;
	frameCount: number;
}) => {
	if (!optimization) {
		return false;
	}

	if (optimization.framesPerLambda !== framesPerLambda) {
		return false;
	}

	if (optimization.frameCount !== frameCount) {
		return false;
	}

	if (optimization.lambdaVersion !== CURRENT_VERSION) {
		return false;
	}

	return true;
};
