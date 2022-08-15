import fs from 'fs';
import path from 'path';

export type FileNameAndSize = {
	filename: string;
	size: number;
};

export function getFolderFiles(folder: string) {
	const files = fs.readdirSync(folder);
	const paths: FileNameAndSize[] = [];
	files.forEach((file) => {
		const full = path.join(folder, file);
		try {
			const stat = fs.statSync(full);
			if (stat.isDirectory()) {
				paths.push(...getFolderFiles(full));
			} else {
				paths.push({
					filename: full,
					size: stat.size,
				});
			}
		} catch (err) {
			if ((err as Error).message.includes('ENOENT')) {
				// Race condition: File was deleted in the meanwhile.
				// Do nothing
			} else {
				throw err;
			}
		}
	});
	return paths;
}
