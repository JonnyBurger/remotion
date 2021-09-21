import {deploySite, getOrCreateBucket} from '../..';
import {getSites} from '../../api/get-sites';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/upload-dir');
jest.mock('../../api/clean-items');
jest.mock('../../api/create-bucket');
jest.mock('../../api/bucket-exists');
jest.mock('../../shared/random-hash');

test('Should have no buckets at first', async () => {
	expect(
		await getSites({
			region: 'us-east-1',
		})
	).toEqual({buckets: [], sites: []});
});

test('Should have a site after deploying', async () => {
	await getOrCreateBucket({
		region: 'eu-central-1',
	});
	expect(
		await deploySite({
			bucketName: 'remotionlambda-abcdef',
			entryPoint: 'first',
			region: 'eu-central-1',
			siteName: 'testing',
		})
	).toEqual({
		url: 'https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testing',
		siteName: 'testing',
	});
	expect(await getSites({region: 'eu-central-1'})).toEqual({
		buckets: [
			{
				CreationDate: new Date(0),
				Name: 'remotionlambda-abcdef',
				region: 'eu-central-1',
			},
		],
		sites: [
			{
				bucketName: 'remotionlambda-abcdef',
				id: 'testing',
				lastModified: 0,
				size: 48,
			},
		],
	});
});
