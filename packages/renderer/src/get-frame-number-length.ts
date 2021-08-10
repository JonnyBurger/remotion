import fs from 'fs';
import {max, min} from './min-max';

// If the biggest frame has the number 100 (3 digits), we need to tell FFMPEG
// that it has to expect up to three digits, etc. We calculate the length of
// the biggest number.
export const getFrameInfo = async ({
	dir,
	isAudioOnly,
}: {
	dir: string;
	isAudioOnly: boolean;
}): Promise<null | {
	numberLength: number;
	startNumber: number;
	filelist: string[];
}> => {
	if (isAudioOnly) {
		return null;
	}

	const files = await fs.promises.readdir(dir);
	const numbers = files
		.filter((f) => f.match(/element-([0-9]+)/))
		.map((f) => {
			return f.match(/element-([0-9]+)/)?.[1] as string;
		})
		.map((f) => Number(f));
	const biggestNumber = max(numbers);
	const smallestNumber = min(numbers);
	const numberLength = String(biggestNumber).length;
	return {numberLength, startNumber: smallestNumber, filelist: files};
};
