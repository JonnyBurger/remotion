import {mkdirSync} from 'fs';
import os from 'os';
import path from 'path';
import {randomHash} from './random-hash';

export const isInLambda = Boolean(process.env.LAMBDA_TASK_ROOT);

export const tmpDir = (str: string) => {
	if (isInLambda) {
		const dir = '/tmp/' + str + randomHash();
		mkdirSync(dir);
		return dir;
	}

	const newDir = path.join(os.tmpdir(), str + randomHash());
	mkdirSync(newDir);
	return newDir;
};
