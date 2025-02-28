import {expect, test} from 'bun:test';
import {hasBeenAborted, IsAnImageError} from '../errors';
import {mediaParserController} from '../media-parser-controller';
import {parseMediaOnWorker} from '../worker';

test('worker should work', async () => {
	const {audioCodec} = await parseMediaOnWorker({
		src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
		fields: {
			audioCodec: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(audioCodec).toBe('aac');
});

test('worker should throw error as normal', () => {
	expect(() =>
		parseMediaOnWorker({
			src: 'wrongurl',
			fields: {
				audioCodec: true,
			},
			acknowledgeRemotionLicense: true,
		}),
	).toThrow('wrongurl is not a URL');
});

test('hasBeenAborted() should still work', async () => {
	const controller = mediaParserController();

	setTimeout(() => {
		controller.abort();
	}, 100);

	try {
		await parseMediaOnWorker({
			src: 'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts',
			fields: {
				structure: true,
			},
			controller,
			acknowledgeRemotionLicense: true,
		});
		throw new Error('Should not resolve');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}

		expect(hasBeenAborted(err)).toBe(true);
	}
});

test('Custom errors should still work', async () => {
	try {
		await parseMediaOnWorker({
			src: 'https://avatars.githubusercontent.com/u/1629785?v=4',
			fields: {
				dimensions: true,
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('Should not resolve');
	} catch (err) {
		expect(err instanceof IsAnImageError).toBe(true);
		if (err instanceof IsAnImageError) {
			expect(err.imageType).toBe('png');
		}
	}
});
