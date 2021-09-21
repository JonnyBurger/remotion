let parallelEncoding = false;

export const setParallelEncoding = (value: boolean) => {
	if (typeof value !== 'boolean') {
		throw new Error(
			`parallelEncoding must be a boolean but got ${typeof value} (${JSON.stringify(
				value
			)})`
		);
	}

	parallelEncoding = value;
};

export const getParallelEncoding = () => parallelEncoding;
