import {describe, expect, it} from 'bun:test';
import {CreateVideoInternals, Template} from 'create-video';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const {FEATURED_TEMPLATES} = CreateVideoInternals;

const getFileForTemplate = (template: Template, file: string) => {
	return path.join(process.cwd(), '..', template.templateInMonorepo, file);
};

const findFile = async (options: string[]) => {
	let entryPoint: string | null = null;
	let contents: string | null = null;
	for (const point of options) {
		const exists = existsSync(point);
		if (exists) {
			const res = readFileSync(point, 'utf-8');
			entryPoint = point;
			contents = res;
			break;
		}
	}

	return {entryPoint, contents};
};

describe('Templates should be valid', () => {
	for (const template of FEATURED_TEMPLATES) {
		it(`${template.shortName} should have a valid package.json`, async () => {
			const packageJson = getFileForTemplate(template, 'package.json');

			const res = readFileSync(packageJson, 'utf8');
			const body = JSON.parse(res);

			expect(body.dependencies.remotion).toBe('workspace:*');
			expect(body.dependencies['@remotion/cli']).toMatch('workspace:*');
			if (body.name === 'template-skia') {
				expect(body.dependencies.react).toMatch(/^\^?18/);
				expect(body.dependencies['react-dom']).toMatch(/^\^?18/);
			} else {
				expect(body.dependencies.react).toMatch(/^\^?19/);
				expect(body.dependencies['react-dom']).toMatch(/^\^?19/);
			}

			if (body.dependencies['zod']) {
				expect(body.dependencies['zod']).toBe('3.23.8');
			}
			if (body.dependencies['@types/web']) {
				expect(body.dependencies['@types/web']).toInclude('0.0.166');
			}

			expect(body.devDependencies.prettier).toMatch('3.3.3');
			expect(body.private).toBe(true);
			expect(body.name).toStartWith('template-');

			if (!template.shortName.includes('JavaScript')) {
				expect(body.devDependencies['typescript']).toInclude('5.5.4');

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const eitherPluginOrConfig =
					body.devDependencies['@remotion/eslint-config']?.match(
						'workspace:*',
					) ||
					body.devDependencies['@remotion/eslint-config-flat']?.match(
						'workspace:*',
					) ||
					body.devDependencies['@remotion/eslint-plugin']?.match('workspace:*');
				expect(eitherPluginOrConfig).toBeTruthy();
			}

			const scripts = body.scripts;
			expect(scripts.dev).toMatch(
				/(remotion\sstudio)|(ts-node src\/studio)|(next dev)|(remix dev)/,
			);
			expect(scripts.build).toMatch(
				/(remotion\sbundle)|(ts-node\ssrc\/render)|(remix\sbuild)|(next\sbuild)/,
			);
		});

		it(`${template.shortName} should not have any lockfiles`, async () => {
			expect(
				existsSync(getFileForTemplate(template, 'package-lock.json')),
			).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'yarn.lock'))).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'pnpm-lock.yaml'))).toBe(
				false,
			);
			expect(existsSync(getFileForTemplate(template, 'bun.lockb'))).toBe(false);
			expect(existsSync(getFileForTemplate(template, 'bun.lock'))).toBe(false);
		});

		it(`${template.shortName} should have a standard entry point`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'src/index.ts'),
				getFileForTemplate(template, 'src/index.js'),
				getFileForTemplate(template, 'remotion/index.ts'),
				getFileForTemplate(template, 'app/remotion/index.ts'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).toMatch(/RemotionRoot/);
		});

		it(`${template.shortName} should have a standard Root file`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'src/Root.tsx'),
				getFileForTemplate(template, 'src/Root.jsx'),
				getFileForTemplate(template, 'remotion/Root.tsx'),
				getFileForTemplate(template, 'app/remotion/Root.tsx'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).toMatch(/export const RemotionRoot/);
		});

		it(`${template.shortName} should use the new config file format`, async () => {
			const {contents, entryPoint} = await findFile([
				getFileForTemplate(template, 'remotion.config.ts'),
				getFileForTemplate(template, 'remotion.config.js'),
			]);
			expect(entryPoint).toBeTruthy();
			expect(contents).not.toContain('Config.Rendering');
			expect(contents).not.toContain('Config.Bundling');
			expect(contents).not.toContain('Config.Log');
			expect(contents).not.toContain('Config.Puppeteer');
			expect(contents).not.toContain('Config.Output');
			expect(contents).not.toContain('Config.Preview');
		});

		it(`${template.shortName} should use good tsconfig values`, async () => {
			if (template.shortName.includes('JavaScript')) {
				return;
			}

			const {contents} = await findFile([
				getFileForTemplate(template, 'tsconfig.json'),
			]);
			if (template.shortName.includes('Skia')) {
				expect(contents).toInclude('noUnusedLocals": false');
			} else {
				expect(contents).toInclude('noUnusedLocals": true');
			}
			if (!template.shortName.includes('Still')) {
				expect(contents).not.toInclude('outDir');
			}
			expect(contents).toInclude('"forceConsistentCasingInFileNames": true');
			expect(contents).not.toInclude('"incremental": true');
		});

		it(`${template.shortName} should use correct prettier`, async () => {
			const {contents} = await findFile([
				getFileForTemplate(template, '.prettierrc'),
			]);
			expect(contents).toBe(`{
  "useTabs": false,
  "bracketSpacing": true,
  "tabWidth": 2
}
`);
		});
		it(`${template.shortName} should reference commands`, async () => {
			const {contents} = await findFile([
				getFileForTemplate(template, 'README.md'),
			]);
			expect(contents).toInclude('npx remotion upgrade');
			expect(contents).toInclude('npx remotion render');
			expect(contents).toInclude('npm run dev');
		});
		it(`${template.shortName} should be registered in tsconfig.json`, async () => {
			const tsconfig = path.join(process.cwd(), '..', '..', 'tsconfig.json');
			const contents = readFileSync(tsconfig, 'utf8');
			const parsed = JSON.parse(contents);

			const references = parsed.references.map((r: any) =>
				r.path.replace('./packages/', ''),
			);
			if (!template.shortName.includes('JavaScript')) {
				expect(references).toContain(template.templateInMonorepo);
			}
		});
		if (!template.shortName.includes('JavaScript')) {
			it(`${template.shortName} should exclude remotion.config.ts`, async () => {
				const tsconfig = path.join(
					process.cwd(),
					'..',
					template.templateInMonorepo,
					'tsconfig.json',
				);
				const contents = readFileSync(tsconfig, 'utf8');
				const parsed = JSON.parse(contents);

				expect(parsed.exclude).toContain('remotion.config.ts');
			});
		}
	}
});
