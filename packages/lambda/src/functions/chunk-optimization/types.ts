import {LambdaVersions} from '../../shared/constants';

export type ObjectChunkTimingData = {
	chunk: number;
	frameRange: [number, number];
	startDate: number;
	timings: {
		[key: number]: number;
	};
};

export type ChunkTimingData = Omit<ObjectChunkTimingData, 'timings'> & {
	timings: number[];
};

export type TimingProfile = ChunkTimingData[];

export type OptimizationProfile = {
	frameRange: [number, number][];
	oldTiming: number;
	newTiming: number;
	frameCount: number;
	createdFromRenderId: string;
	framesPerLambda: number;
	lambdaVersion: LambdaVersions;
};
