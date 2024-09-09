import type {Writer, WriterInterface} from './writer';

const createContent = () => {
	const buf = new ArrayBuffer(0, {
		// TODO: Educate that the buffer is limited to 100MB
		maxByteLength: 100_000_000,
	});
	if (!buf.resize) {
		throw new Error('Could not create buffer writer');
	}

	let data = new Uint8Array(buf);

	const write = (newData: Uint8Array) => {
		const oldLength = buf.byteLength;
		const newLength = oldLength + newData.byteLength;
		buf.resize(newLength);
		const newArray = new Uint8Array(buf);
		newArray.set(newData, oldLength);
		data = newArray;
	};

	const updateDataAt = (position: number, newData: Uint8Array) => {
		const newArray = new Uint8Array(buf);
		newArray.set(newData, position);
		data = newArray;
	};

	let writPromise = Promise.resolve();

	let removed = false;

	const writer: Writer = {
		write: (arr: Uint8Array) => {
			writPromise = writPromise.then(() => write(arr));
			return writPromise;
		},
		save: () => {
			if (removed) {
				return Promise.reject(
					new Error('Already called .remove() on the result'),
				);
			}

			// TODO: Unhardcode name
			return Promise.resolve(new File([data], 'hithere', {}));
		},
		remove() {
			removed = true;
			data = new Uint8Array(0);
			return Promise.resolve();
		},
		getWrittenByteCount: () => buf.byteLength,
		updateDataAt: (position: number, newData: Uint8Array) => {
			writPromise = writPromise.then(() => updateDataAt(position, newData));
			return writPromise;
		},
		waitForFinish: async () => {
			await writPromise;
		},
	};
	return Promise.resolve(writer);
};

export const bufferWriter: WriterInterface = {
	createContent,
};
