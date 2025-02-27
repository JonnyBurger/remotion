import {expect, test} from 'bun:test';
import {execSync} from 'child_process';
import path from 'path';

test('Should be able to start the studio without zod installed', () => {
	const res = execSync('bunx remotion studio --test-for-server-open', {
		cwd: path.join(process.cwd(), '..', 'example-without-zod'),
	}).toString('utf-8');

	// Should not print warnings or errors
	expect(res.length).toBeLessThan(200);

	expect(res).toContain('Yes, the server started.');
});

test('Should be able to start the studio', () => {
	const res = execSync('bunx remotion studio --test-for-server-open', {
		cwd: path.join(process.cwd(), '..', 'example'),
	}).toString('utf-8');
	// Should not print warnings or errors
	expect(res.length).toBeLessThan(200);
	expect(res).toContain('Yes, the server started.');
});
