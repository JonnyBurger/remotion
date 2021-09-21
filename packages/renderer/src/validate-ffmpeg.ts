import execa from 'execa';
import fs from 'fs';
import os from 'os';

const existsMap: {[key: string]: boolean} = {};

export const binaryExists = async (name: 'ffmpeg' | 'brew') => {
	if (typeof existsMap[name] !== 'undefined') {
		return existsMap[name];
	}

	// On AWS lambda, look for a specific path
	if (name === 'ffmpeg' && process.env.LAMBDA_TASK_ROOT) {
		return fs.existsSync('/opt/bin/ffmpeg');
	}

	const isWin = os.platform() === 'win32';
	const where = isWin ? 'where' : 'which';
	try {
		await execa(where, [name]);
		existsMap[name] = true;
		return true;
	} catch (err) {
		existsMap[name] = false;
		return false;
	}
};

export const isHomebrewInstalled = async (): Promise<boolean> => {
	return binaryExists('brew');
};

export const validateFfmpeg = async (): Promise<void> => {
	const ffmpegExists = await binaryExists('ffmpeg');
	if (!ffmpegExists) {
		console.error('It looks like FFMPEG is not installed');
		if (os.platform() === 'darwin' && (await isHomebrewInstalled())) {
			console.error('Run `brew install ffmpeg` to install ffmpeg');
		} else if (os.platform() === 'win32') {
			console.error('1. Install FFMPEG for Windows here:');
			console.error(
				'https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg#installing-ffmpeg-in-windows'
			);
			console.error('2. Add FFMPEG to your PATH');
			console.error('  a. Go to the settings app.');
			console.error('  b. Click System.');
			console.error('  c. Click About.');
			console.error('  d. Click Advanced system settings.');
			console.error('  e. Click Environment variables.');
			console.error(
				'  f. Search for PATH environemnt variable, click edit and the folder where you installed FFMPEG.'
			);
			console.error(
				'  g. Important: Restart your terminal completely to apply the new PATH.'
			);
			console.error('3. Re-run this command.');
		} else {
			console.error(
				'See https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg on how to install FFMPEG.'
			);
		}

		process.exit(1);
	}
};
