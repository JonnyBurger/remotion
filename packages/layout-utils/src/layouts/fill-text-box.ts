import {measureText, type Word} from './measure-text';

export const fillTextBox = ({
	maxBoxWidth,
	maxLines,
}: {
	maxBoxWidth: number;
	maxLines: number;
}) => {
	const lines: Word[][] = new Array(maxLines).fill(0).map(() => [] as Word[]);

	return {
		add: ({
			text,
			fontFamily,
			fontWeight,
			fontSize,
			letterSpacing,
			fontVariantNumeric,
			validateFontIsLoaded = true,
			textTransform,
			additionalStyles,
		}: Word): {
			exceedsBox: boolean;
			newLine: boolean;
		} => {
			const lastLineIndex = lines.reduceRight((acc, curr, index) => {
				if (acc === -1 && curr.length > 0) {
					return index;
				}

				return acc;
			}, -1);
			const currentlyAt = lastLineIndex === -1 ? 0 : lastLineIndex;
			const lineToUse = lines[currentlyAt];

			const lineWithWord: Word[] = [
				...lineToUse,
				{
					text,
					fontFamily,
					fontWeight,
					fontSize,
					letterSpacing,
					fontVariantNumeric,
					validateFontIsLoaded,
					textTransform,
					additionalStyles,
				},
			];

			const widths = lineWithWord.map((w) => measureText(w).width);
			const lineWidthWithWordAdded = widths.reduce((a, b) => a + b, 0);

			if (Math.ceil(lineWidthWithWordAdded) < maxBoxWidth) {
				lines[currentlyAt].push({
					text: lines[currentlyAt].length === 0 ? text.trimStart() : text,
					fontFamily,
					fontWeight,
					fontSize,
					letterSpacing,
					fontVariantNumeric,
				});

				return {exceedsBox: false, newLine: false};
			}

			if (currentlyAt === maxLines - 1) {
				return {exceedsBox: true, newLine: false};
			}

			lines[currentlyAt + 1] = [
				{
					text: text.trimStart(),
					fontFamily,
					fontWeight,
					fontSize,
					letterSpacing,
					fontVariantNumeric,
				},
			];
			return {exceedsBox: false, newLine: true};
		},
	};
};
