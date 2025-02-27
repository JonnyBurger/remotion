import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react(),
		dts({
			insertTypesEntry: true,
			include: ['src/lib'],
			outDir: 'dist',
			rollupTypes: true,
			// This will ensure types are at dist root, not dist/lib
			beforeWriteFile: (filePath, content) => ({
				filePath: filePath.replace('/src/lib', ''),
				content,
			}),
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/lib/index.ts'),
			name: 'ChromaKeyEffect',
			fileName: (format) => `index.${format}.js`,
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'remotion'],
			output: {
				exports: 'named',
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					remotion: 'Remotion',
				},
			},
		},
	},
});
