import {AwsRegion} from '..';
import {LambdaVersions} from '../shared/constants';
import {FunctionInfo} from './get-function-info';

export let mockFunctionsStore: (FunctionInfo & {
	region: AwsRegion;
	version: LambdaVersions;
})[] = [];

export const addFunction = (fn: FunctionInfo, region: AwsRegion) => {
	mockFunctionsStore.push({...fn, region, version: fn.version});
};

export const deleteMockFunction = (name: string, region: string) => {
	mockFunctionsStore = mockFunctionsStore.filter(
		(fn) => fn.functionName !== name && fn.region !== region
	);
};

export const findFunction = (name: string, region: string) => {
	return mockFunctionsStore.find(
		(n) => n.functionName === name && region === n.region
	);
};

export const getAllMockFunctions = (
	region: string,
	version: LambdaVersions | null
) => {
	return mockFunctionsStore.filter(
		(f) => f.region === region && (version ? f.version === version : true)
	);
};

export const cleanFnStore = () => {
	mockFunctionsStore = [];
};

export const markFunctionAsIncompatible = (functionName: string) => {
	for (const fn of mockFunctionsStore) {
		if (fn.functionName === functionName) {
			fn.version = '2021-06-23';
		}
	}
};
