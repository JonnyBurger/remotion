const formatTime = (time: number) => {
	return time + 'ms';
};

export const timer = (label: string) => {
	const start = Date.now();

	return {
		end: () => {
			const end = Date.now();
			const time = end - start;

			process.stdout.write(`${label} - ${formatTime(time)}\n`);
		},
	};
};
