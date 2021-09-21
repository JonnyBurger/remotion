import {renderStill} from '../render-still';

test('Need to pass valid metadata', async () => {
	return expect(() =>
		renderStill({
			composition: {
				width: NaN,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
			},
			frame: 0,
			output: '/file/output.png',
			serveUrl: '/hi/there',
		})
	).rejects.toThrow(/not be NaN, but is NaN/);
});

test('Need to pass valid metadata', async () => {
	return expect(() =>
		renderStill({
			composition: {
				width: 1000,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
			},
			frame: 200,
			output: '/file/output.png',
			serveUrl: '/hi/there',
		})
	).rejects.toThrow(
		/Cannot use frame 200: Duration of composition is 30, therefore the highest frame that can be rendered is 29/
	);
});

test('Catches invalid image format', async () => {
	return expect(() =>
		renderStill({
			composition: {
				width: 1000,
				height: 1000,
				fps: 30,
				durationInFrames: 30,
				id: 'hithere',
			},
			// @ts-expect-error
			imageFormat: 'jjj',
			frame: 200,
			output: '/file/output.png',
			serveUrl: '/hi/there',
		})
	).rejects.toThrow(/Image format should be either "png" or "jpeg"/);
});
