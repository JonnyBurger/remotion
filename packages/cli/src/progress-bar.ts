// @ts-expect-error
import ansiDiff from 'ansi-diff';
import chalk from 'chalk';
import {Internals} from 'remotion';

export const createProgressBar = (): {
	update: (str: string) => boolean;
} => {
	if (!Internals.Logging.isEqualOrBelowLogLevel('info')) {
		return {update: () => false};
	}

	const diff = ansiDiff();
	process.stdout.write('');
	return {
		update: (up: string): boolean => process.stdout.write(diff.update(up)),
	};
};

export const makeProgressBar = (percentage: number) => {
	const totalBars = 20;
	const barsToShow = Math.floor(percentage * totalBars);
	return `[${'='.repeat(barsToShow).padEnd(totalBars, ' ')}]`;
};

export const makeBundlingProgress = ({
	progress,
	steps,
	doneIn,
}: {
	progress: number;
	steps: number;
	doneIn: number | null;
}) =>
	[
		'📦',
		`(1/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Bundled' : 'Bundling'} code`,
		doneIn === null
			? (progress * 100).toFixed(0) + '%'
			: chalk.gray(`${doneIn}ms`),
	].join(' ');

export const makeRenderingProgress = ({
	frames,
	totalFrames,
	encodedFrames,
	steps,
	concurrency,
	doneIn,
}: {
	frames: number;
	totalFrames: number;
	encodedFrames?: number;
	steps: number;
	concurrency: number;
	doneIn: number | null;
}) => {
	const progress = frames / totalFrames;
	return [
		'🖼 ',
		`(2/${steps})`,
		makeProgressBar(progress),
		`${doneIn ? 'Rendered' : 'Rendering'}${
			encodedFrames === undefined
				? ''
				: ` and ${doneIn ? 'Encoded' : 'Encoding'}`
		} frames (${concurrency}x)`,
		doneIn === null
			? `${
					encodedFrames === undefined ? '' : `${encodedFrames}/`
			  }${frames}/${totalFrames}`
			: chalk.gray(`${doneIn}ms`),
	].join(' ');
};

export const makeStitchingProgress = ({
	frames,
	totalFrames,
	steps,
	doneIn,
	parallelEncoding,
}: {
	frames: number;
	totalFrames: number;
	steps: number;
	doneIn: number | null;
	parallelEncoding?: boolean;
}) => {
	const progress = frames / totalFrames;
	return [
		'🎞 ',
		`(3/${steps})`,
		makeProgressBar(progress),
		parallelEncoding
			? `${doneIn ? 'Muxed' : 'Muxing'} audio`
			: `${doneIn ? 'Encoded' : 'Encoding'} video`,
		doneIn === null ? `${frames}/${totalFrames}` : chalk.gray(`${doneIn}ms`),
	].join(' ');
};
