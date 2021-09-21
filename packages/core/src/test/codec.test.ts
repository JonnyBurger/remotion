import {
	CodecOrUndefined,
	getFinalOutputCodec,
	getOutputCodecOrUndefined,
	setCodec,
} from '../config/codec';
import {expectToThrow} from './expect-to-throw';

// getFinalOutputCodec

describe('Codec tests valid codec input', () => {
	const validCodecInput: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		'mp3',
		'aac',
		'wav',
		'h264-mkv',
	];
	validCodecInput.forEach((entry) =>
		test(`codec ${entry}`, () =>
			expect(
				getFinalOutputCodec({
					codec: entry,
					emitWarning: false,
					fileExtension: '',
					isLambda: false,
				})
			).toEqual(entry))
	);
});

describe('Codec tests undefined codec input with known extension', () => {
	const codecExtensionCombination: [string, string][] = [
		['vp8', 'webm'],
		['h265', 'hevc'],
		['mp3', 'mp3'],
		['wav', 'wav'],
		['aac', 'aac'],
		['aac', 'm4a'],
	];
	const inputCodecs: CodecOrUndefined[] = ['h264', undefined];
	inputCodecs.forEach((codec) =>
		codecExtensionCombination.forEach((entry) =>
			test(
				codec
					? `should not look for extension ${entry[1]}`
					: `${entry[1]} should be recognized as ${entry[0]}`,
				() =>
					expect(
						getFinalOutputCodec({
							codec,
							emitWarning: false,
							fileExtension: entry[1],
							isLambda: false,
						})
					).toEqual(codec ?? entry[0])
			)
		)
	);
});

describe('Codec tests undefined codec input with unknown extension', () => {
	const unknownExtensions = ['', 'abc'];
	unknownExtensions.forEach((entry) =>
		test(`testing with "${entry}" as extension`, () =>
			expect(
				getFinalOutputCodec({
					codec: undefined,
					emitWarning: false,
					fileExtension: entry,
					isLambda: false,
				})
			).toEqual('h264'))
	);
});

// setCodec

describe('Codec tests setOutputFormat', () => {
	const validCodecInputs: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		undefined,
	];
	validCodecInputs.forEach((entry) =>
		test(`testing with ${entry}`, () => {
			setCodec(entry);
			expect(getOutputCodecOrUndefined()).toEqual(entry);
		})
	);
	test('setCodec with invalid coded', () => {
		expectToThrow(
			// @ts-expect-error
			() => setCodec('invalid'),
			/Codec must be one of the following:/
		);
	});
});
