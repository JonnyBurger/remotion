let framesPerLambda: number | null;

export const getFramesPerLambda = (): number | null => {
	return framesPerLambda;
};

export const setFramesPerLambda = (newFrames: number) => {
	framesPerLambda = newFrames;
};
