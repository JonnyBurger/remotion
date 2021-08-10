#! /usr/bin/env node --experimental-wasm-threads
const {cli} = require('./dist/index');

cli()
	.then(() => process.exit(0))
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});
