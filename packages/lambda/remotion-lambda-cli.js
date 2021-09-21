#! /usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();
const {cli} = require('./dist/cli/index');

cli()
	.then(() => process.exit(0))
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});
