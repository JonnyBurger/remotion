import {zGoogleFont} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const googleFontsPickerSchema = z.object({
	font: zGoogleFont().optional(),
});

const GoogleFontsPicker: React.FC<z.infer<typeof googleFontsPickerSchema>> = ({
	font,
}) => {
	return (
		<AbsoluteFill>
			<h1
				style={{
					fontFamily: font,
				}}
			>
				Text
			</h1>
		</AbsoluteFill>
	);
};

export default GoogleFontsPicker;
