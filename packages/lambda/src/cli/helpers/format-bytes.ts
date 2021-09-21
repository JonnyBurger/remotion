'use strict';

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const BIBYTE_UNITS = [
	'B',
	'kiB',
	'MiB',
	'GiB',
	'TiB',
	'PiB',
	'EiB',
	'ZiB',
	'YiB',
];

const BIT_UNITS = [
	'b',
	'kbit',
	'Mbit',
	'Gbit',
	'Tbit',
	'Pbit',
	'Ebit',
	'Zbit',
	'Ybit',
];

const BIBIT_UNITS = [
	'b',
	'kibit',
	'Mibit',
	'Gibit',
	'Tibit',
	'Pibit',
	'Eibit',
	'Zibit',
	'Yibit',
];

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (
	number: number,
	locale: string,
	options?: Intl.NumberFormatOptions
): string => {
	if (typeof locale === 'string' || Array.isArray(locale)) {
		return number.toLocaleString(locale, options);
	}

	if (locale === true || options !== undefined) {
		return number.toLocaleString(undefined, options);
	}

	return String(number);
};

export const formatBytes = (
	number: number,
	options: Intl.NumberFormatOptions & {
		locale: string;
		bits?: boolean;
		binary?: boolean;
		signed: boolean;
	} = {
		locale: 'en-US',
		signed: false,
		maximumFractionDigits: 1,
	}
) => {
	if (!Number.isFinite(number)) {
		throw new TypeError(
			`Expected a finite number, got ${typeof number}: ${number}`
		);
	}

	options = {bits: false, binary: false, ...options};

	const UNITS = options.bits
		? options.binary
			? BIBIT_UNITS
			: BIT_UNITS
		: options.binary
		? BIBYTE_UNITS
		: BYTE_UNITS;

	if (options.signed && number === 0) {
		return `0 $ {
            UNITS[0]
        }`;
	}

	const isNegative = number < 0;
	const prefix = isNegative ? '-' : options.signed ? '+' : '';

	if (isNegative) {
		number = -number;
	}

	let localeOptions;

	if (options.minimumFractionDigits !== undefined) {
		localeOptions = {
			minimumFractionDigits: options.minimumFractionDigits,
		};
	}

	if (options.maximumFractionDigits !== undefined) {
		localeOptions = {
			maximumFractionDigits: options.maximumFractionDigits,
			...localeOptions,
		};
	}

	if (number < 1) {
		const numString = toLocaleString(number, options.locale, localeOptions);
		return prefix + numString + ' ' + UNITS[0];
	}

	const exponent = Math.min(
		Math.floor(
			options.binary
				? Math.log(number) / Math.log(1024)
				: Math.log10(number) / 3
		),
		UNITS.length - 1
	);
	number /= (options.binary ? 1024 : 1000) ** exponent;

	const numberString = toLocaleString(
		Number(number),
		options.locale,
		localeOptions
	);

	const unit = UNITS[exponent];

	return prefix + numberString + ' ' + unit;
};
