import {deleteFunction} from '../../api/delete-function';
import {deployFunction} from '../../api/deploy-function';
import {ensureLambdaBinaries} from '../../api/ensure-lambda-binaries';
import {getFunctions} from '../../api/get-functions';
import {
	cleanFnStore,
	markFunctionAsIncompatible,
} from '../../api/mock-functions';
import {CURRENT_VERSION} from '../../shared/constants';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../shared/random-hash');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/create-bucket');
jest.mock('../../api/upload-dir');
jest.mock('../../api/bucket-exists');
jest.mock('../../api/clean-items');
jest.mock('../../api/ensure-lambda-binaries');
jest.mock('../../api/create-function');
jest.mock('../../api/delete-function');
jest.mock('../../api/bundle-lambda');
jest.mock('../../api/get-functions');
jest.mock('../../shared/get-account-id');

test('Should be able to deploy function', async () => {
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
});

test('Should not be able to deploy function if binaries were not ensured', async () => {
	await expect(() =>
		deployFunction({
			layerArn: 'us-east-2',
			memorySizeInMb: 2048,
			region: 'us-east-2',
			timeoutInSeconds: 120,
		})
	).rejects.toThrow(/did not ensure layer for/);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: 'remotion-render-abcdef',
			memorySizeInMb: 1024,
			timeoutInSeconds: 120,
			version: CURRENT_VERSION,
			region: 'us-east-1',
		},
	]);
	const foreignFunctions = await getFunctions({
		region: 'us-east-2',
		compatibleOnly: true,
	});
	expect(foreignFunctions).toEqual([]);
});

test('Should be able to delete the function', async () => {
	cleanFnStore();
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
	await deleteFunction({
		region: 'us-east-1',
		functionName: 'remotion-render-abcdef',
	});
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([]);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: 'remotion-render-abcdef',
			memorySizeInMb: 1024,
			timeoutInSeconds: 120,
			version: CURRENT_VERSION,
			region: 'us-east-1',
		},
	]);
	markFunctionAsIncompatible('remotion-render-abcdef');
	const compatibleFns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	const incompatibleFns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: false,
	});
	expect(compatibleFns).toEqual([]);
	expect(incompatibleFns).toEqual([
		{
			functionName: 'remotion-render-abcdef',
			memorySizeInMb: 1024,
			timeoutInSeconds: 120,
			version: '2021-06-23',
			region: 'us-east-1',
		},
	]);
});
