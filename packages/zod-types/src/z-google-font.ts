import {getAvailableFonts} from '@remotion/google-fonts';
import {z} from 'zod';

const fonts = getAvailableFonts();
const fontImportNames = fonts.map(({importName}) => importName);

// z.enum requires const arrays for compile time
// below is a trick to set default to Roboto and add other fonts dynamically
export const zGoogleFont = () => z.enum(['Roboto', ...fontImportNames]);
