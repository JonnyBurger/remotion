import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {execSync} from 'node:child_process';
import {startLongRunningCompositor} from '../compositor/compositor';

function getMemoryUsageByPid(pid: string) {
	const data = execSync(`top -l 1 -pid ${pid} -stats mem`);
	const str = data.toString('utf-8');
	const lines = str.split('\n');
	const last = lines[lines.length - 2];

	if (last.endsWith('G')) {
		return parseFloat(last.replace('G', '').trim()) * 1024 * 1024 * 1024;
	}

	if (last.endsWith('M')) {
		return parseInt(last.replace('M', '').trim(), 10) * 1024 * 1024;
	}

	if (last.endsWith('K')) {
		return parseInt(last.replace('K', '').trim(), 10) * 1024;
	}

	return parseInt(last, 10);
}

test(
	'Memory usage should be determined ',
	async () => {
		if (process.platform !== 'darwin') {
			return;
		}

		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: 40 * 24 * 1024 * 1024,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		expect(
			getMemoryUsageByPid((compositor.pid as Number).toString()),
		).toBeLessThan(10 * 1024 * 1024);

		await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.bigBuckBunny,
			original_src: exampleVideos.bigBuckBunny,
			time: 3.333,
			transparent: false,
			tone_mapped: false,
		});

		const stats = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson = JSON.parse(new TextDecoder('utf-8').decode(stats));
		expect(statsJson.frames_in_cache).toBe(84);
		expect(statsJson.open_streams).toBe(1);

		await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.framerWithoutFileExtension,
			original_src: exampleVideos.framerWithoutFileExtension,
			time: 3.333,
			transparent: false,
			tone_mapped: false,
		});

		const stats2 = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson2 = JSON.parse(new TextDecoder('utf-8').decode(stats2));

		expect(
			statsJson2.frames_in_cache === 185 || statsJson2.frames_in_cache === 184,
		).toBe(true);
		expect(statsJson2.open_streams).toBe(2);

		await compositor.executeCommand('FreeUpMemory', {
			remaining_bytes: 100 * 24 * 1024 * 1024,
		});

		const stats3 = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson3 = JSON.parse(new TextDecoder('utf-8').decode(stats3));
		expect(statsJson3.frames_in_cache).toBe(184);

		await compositor.executeCommand('FreeUpMemory', {
			remaining_bytes: 100 * 24 * 1024 * 1024,
		});

		const stats4 = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson4 = JSON.parse(new TextDecoder('utf-8').decode(stats4));
		expect(statsJson4).toEqual({
			frames_in_cache: 184,
			open_streams: 2,
		});

		await compositor.executeCommand('FreeUpMemory', {
			remaining_bytes: 1,
		});

		const stats5 = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson5 = JSON.parse(new TextDecoder('utf-8').decode(stats5));
		expect(statsJson5).toEqual({
			frames_in_cache: 0,
			open_streams: 0,
		});

		await new Promise((resolve) => {
			setTimeout(resolve, 3000);
		});
		expect(
			getMemoryUsageByPid((compositor.pid as Number).toString()),
		).toBeLessThan(40 * 1024 * 1024);

		await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.framerWithoutFileExtension,
			original_src: exampleVideos.framerWithoutFileExtension,
			time: 3.333,
			transparent: false,
			tone_mapped: false,
		});
	},
	{timeout: 10000},
);

test('Should respect the maximum frame cache limit', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: 50 * 24 * 1024 * 1024,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
		tone_mapped: false,
	});

	const stats = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson = JSON.parse(new TextDecoder('utf-8').decode(stats));
	expect(statsJson).toEqual({
		frames_in_cache: 84,
		open_streams: 1,
	});
});

test('Should be able to take commands for freeing up memory', async () => {
	if (process.platform !== 'darwin') {
		return;
	}

	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: 100 * 24 * 1024 * 1024,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString()),
	).toBeLessThan(10 * 1024 * 1024);

	await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
		tone_mapped: false,
	});

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString()),
	).toBeGreaterThan(100 * 1024 * 1024);

	await compositor.executeCommand('CloseAllVideos', {});

	expect(
		getMemoryUsageByPid((compositor.pid as Number).toString()),
	).toBeLessThan(25 * 1024 * 1024);
});
