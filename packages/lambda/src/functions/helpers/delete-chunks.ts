import {_Object} from '@aws-sdk/client-s3';
import {AwsRegion} from '../..';
import {cleanItems} from '../../api/clean-items';
import {getFilesToDelete} from './get-files-to-delete';

export const deleteChunks = async ({
	renderId,
	chunkCount,
	bucket,
	region,
	contents,
}: {
	renderId: string;
	chunkCount: number;
	bucket: string;
	region: AwsRegion;
	contents: _Object[];
}) => {
	const toDelete = getFilesToDelete({
		chunkCount,
		renderId,
	});

	await cleanItems({
		bucket,
		region,
		list: toDelete.map((item) => {
			if (item.type === 'exact') {
				return item.name;
			}

			if (item.type === 'prefix') {
				return contents.find((c) => c.Key?.startsWith(item.name))
					?.Key as string;
			}

			throw new Error('unexpected in deleteChunks()');
		}),
		onAfterItemDeleted: () => undefined,
		onBeforeItemDeleted: () => undefined,
	});
};
