export const sleep = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
