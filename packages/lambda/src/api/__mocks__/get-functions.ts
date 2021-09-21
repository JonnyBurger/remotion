import {CURRENT_VERSION} from '../../defaults';
import {getFunctions as original} from '../get-functions';
import {getAllMockFunctions} from '../mock-functions';

export const getFunctions: typeof original = async ({
	region,
	compatibleOnly,
}) => {
	return getAllMockFunctions(region, compatibleOnly ? CURRENT_VERSION : null);
};
