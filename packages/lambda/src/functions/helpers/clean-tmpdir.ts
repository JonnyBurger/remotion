import fs from 'fs';
import {join} from 'path';
import {
	CONCAT_TMPDIR,
	DOWNLOADS_DIR,
	OUTPUT_PATH_PREFIX,
	REMOTION_CONCATED_TMP_PREFIX,
	REMOTION_FILELIST_TMP_PREFIX,
	RENDERER_PATH_PREFIX,
} from '../../shared/constants';

export let deletedFiles: string[] = [];
export let deletedFilesSize = 0;

const deleteAllFilesInAFolderRecursively = (path: string) => {
	const files = fs.readdirSync(path);
	files.forEach((file) => {
		const filePath = join(path, file);
		if (
			!filePath.startsWith(OUTPUT_PATH_PREFIX) &&
			!filePath.startsWith(DOWNLOADS_DIR) &&
			!filePath.startsWith(RENDERER_PATH_PREFIX) &&
			!filePath.startsWith(CONCAT_TMPDIR) &&
			!filePath.startsWith(REMOTION_CONCATED_TMP_PREFIX) &&
			!filePath.startsWith(REMOTION_FILELIST_TMP_PREFIX) &&
			!filePath.startsWith('/tmp/puppeteer_dev_chrome')
		) {
			return;
		}

		try {
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) {
				deleteAllFilesInAFolderRecursively(filePath);
			} else {
				fs.unlinkSync(filePath);
				deletedFiles.push(filePath);
				deletedFilesSize += stat.size;
			}
		} catch (err) {
			// TODO: why can statsync fail?
		}
	});
	if (path !== '/tmp') {
		fs.rmSync(path, {recursive: true, force: true});
	}
};

export const deleteTmpDir = () => {
	deletedFiles = [];
	deletedFilesSize = 0;
	if (typeof jest === 'undefined') {
		deleteAllFilesInAFolderRecursively('/tmp');
	}
};
