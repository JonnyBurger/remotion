import type {TAsset} from 'remotion';
import type {RenderMediaOnDownload} from './download-and-map-assets-to-file';
import {downloadAndMapAssetsToFileUrl} from './download-and-map-assets-to-file';
import type {DownloadMap} from './download-map';

const chunk = <T>(input: T[], size: number) => {
	return input.reduce<T[][]>((arr, item, idx) => {
		return idx % size === 0
			? [...arr, [item]]
			: [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
	}, []);
};

export const convertAssetsToFileUrls = async ({
	assets,
	onDownload,
	downloadMap,
}: {
	assets: TAsset[][];
	onDownload: RenderMediaOnDownload;
	downloadMap: DownloadMap;
}): Promise<TAsset[][]> => {
	const chunks = chunk(assets, 1000);
	const results: TAsset[][][] = [];

	for (const ch of chunks) {
		const result = await Promise.all(
			ch.map((assetsForFrame) => {
				return Promise.all(
					assetsForFrame.map((a) => {
						return downloadAndMapAssetsToFileUrl({
							asset: a,
							onDownload,
							downloadMap,
						});
					})
				);
			})
		);
		results.push(result);
	}

	return results.flat(1);
};
