import {getFolderFiles} from './get-files-in-folder';

export function getFolderSizeRecursively(folder: string) {
	return getFolderFiles(folder).reduce((a, b) => a + b.size, 0);
}
