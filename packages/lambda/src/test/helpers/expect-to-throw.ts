export const expectToThrow = (func: Function, err: RegExp) => {
	// Even though the error is caught, it still gets printed to the console
	// so we mock that out to avoid the wall of red text.
	jest.spyOn(console, 'error');
	// @ts-expect-error
	console.error.mockImplementation(() => undefined);

	expect(func).toThrow(err);

	// @ts-expect-error
	console.error.mockRestore();
};
