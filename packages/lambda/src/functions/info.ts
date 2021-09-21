import {
	CURRENT_VERSION,
	LambdaPayload,
	LambdaRoutines,
	LambdaVersions,
} from '../shared/constants';

export const infoHandler = async (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue: {
		version: LambdaVersions;
	} = {
		version: CURRENT_VERSION,
	};

	return returnValue;
};
