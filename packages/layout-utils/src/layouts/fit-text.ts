import type {
	ModifyableCSSProperties,
	TextTransform,
} from '../layouts/measure-text';
import {measureText} from '../layouts/measure-text';

const sampleSize = 100;
/*
 * @description Calculates the font size needed to fit text into a specified width container.
 * @see [Documentation](https://remotion.dev/docs/layout-utils/fit-text)
 */
export const fitText = ({
	text,
	withinWidth,
	fontFamily,
	fontVariantNumeric,
	fontWeight,
	letterSpacing,
	validateFontIsLoaded = true,
	additionalStyles,
	textTransform,
}: {
	text: string;
	withinWidth: number;
	fontFamily: string;
	fontWeight?: number | string;
	letterSpacing?: string;
	fontVariantNumeric?: string;
	validateFontIsLoaded?: boolean;
	textTransform?: TextTransform;
	additionalStyles?: ModifyableCSSProperties;
}) => {
	const estimate = measureText({
		text,
		fontFamily,
		fontSize: sampleSize,
		fontWeight,
		fontVariantNumeric,
		letterSpacing,
		validateFontIsLoaded,
		textTransform,
		additionalStyles,
	});

	return {fontSize: (withinWidth / estimate.width) * sampleSize};
};
