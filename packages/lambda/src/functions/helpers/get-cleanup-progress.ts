import {_Object} from '@aws-sdk/client-s3';
import {CleanupInfo} from '../../shared/constants';
import {getFilesToDelete} from './get-files-to-delete';

export const getCleanupProgress = ({
	contents,
	output,
	chunkCount,
	renderId,
}: {
	contents: _Object[];
	output: string | null;
	chunkCount: number;
	renderId: string;
}): null | CleanupInfo => {
	if (output === null) {
		return null;
	}

	const filesToDelete = getFilesToDelete({chunkCount, renderId});
	const filesStillThere = contents.filter((c) => {
		return filesToDelete.find((f) => {
			if (f.type === 'exact') {
				return f.name === c.Key;
			}

			if (f.type === 'prefix') {
				return c.Key?.startsWith(f.name);
			}

			throw new Error('Unexpected in getCleanupProgress');
		});
	});

	const filesDeleted = filesToDelete.length - filesStillThere.length;

	return {
		filesToDelete: filesToDelete.length,
		filesDeleted,
		done: filesStillThere.length === 0,
	};
};
