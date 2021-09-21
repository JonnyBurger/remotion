import {deleteFunction as original} from '../delete-function';
import {deleteMockFunction} from '../mock-functions';

export const deleteFunction: typeof original = ({region, functionName}) => {
	deleteMockFunction(functionName, region);

	return Promise.resolve();
};
