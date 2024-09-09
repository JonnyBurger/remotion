import type {ReaderInterface} from './reader';

export const fetchReader: ReaderInterface = {
	read: async (src, range, signal) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `fetchReader`');
		}

		const resolvedUrl =
			typeof window !== 'undefined' && typeof window.location !== 'undefined'
				? new URL(src, window.location.origin).toString()
				: src;

		if (
			!resolvedUrl.startsWith('https://') &&
			!resolvedUrl.startsWith('blob:') &&
			!resolvedUrl.startsWith('http://')
		) {
			return Promise.reject(
				new Error(
					resolvedUrl +
						' is not a URL - needs to start with http:// or https:// or blob:. If you want to read a local file, pass `reader: nodeReader` to parseMedia().',
				),
			);
		}

		const controller = new AbortController();

		const res = await fetch(resolvedUrl, {
			headers:
				range === null
					? {}
					: typeof range === 'number'
						? {
								Range: `bytes=${range}`,
							}
						: {
								Range: `bytes=${`${range[0]}-${range[1]}`}`,
							},
			signal: controller.signal,
			// Disable Next.js caching
			cache: 'no-store',
		});

		signal?.addEventListener(
			'abort',
			() => {
				controller.abort();
			},
			{once: true},
		);

		if (
			res.status.toString().startsWith('4') ||
			res.status.toString().startsWith('5')
		) {
			throw new Error(`Server returned status code ${res.status} for ${src}`);
		}

		if (!res.body) {
			throw new Error('No body');
		}

		const length = res.headers.get('content-length');

		const contentLength = length === null ? null : parseInt(length, 10);
		const contentDisposition = res.headers.get('content-disposition');
		const name = contentDisposition?.match(/filename="([^"]+)"/)?.[1];

		const fallbackName = src.split('/').pop();

		const reader = res.body.getReader();

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					reader.cancel().catch(() => {
						// Prevent unhandled rejection in Firefox
					});
				},
				{once: true},
			);
		}

		return {
			reader: {
				reader,
				abort: () => {
					controller.abort();
				},
			},
			contentLength,
			name: name ?? (fallbackName as string),
		};
	},
	getLength: async (src) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `fetchReader`');
		}

		const res = await fetch(src, {
			method: 'HEAD',
		});
		if (!res.body) {
			throw new Error('No body');
		}

		const length = res.headers.get('content-length');
		if (!length) {
			throw new Error('No content-length');
		}

		return parseInt(length, 10);
	},
};
