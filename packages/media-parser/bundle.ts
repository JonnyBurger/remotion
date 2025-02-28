import {buildPackage} from '../.monorepo/builder';

await buildPackage({
	formats: {
		esm: 'build',
		cjs: 'use-tsc',
	},
	entrypoints: [
		{
			path: 'src/index.ts',
			target: 'browser',
		},
		{
			path: 'src/web-file.ts',
			target: 'browser',
		},
		{
			path: 'src/fetch.ts',
			target: 'browser',
		},
		{
			path: 'src/node.ts',
			target: 'node',
		},
		{
			path: 'src/node-writer.ts',
			target: 'node',
		},
		{
			path: 'src/worker-server.ts',
			target: 'browser',
		},
		{
			path: 'src/worker.ts',
			target: 'browser',
		},
	],
	external: ['stream'],
});
