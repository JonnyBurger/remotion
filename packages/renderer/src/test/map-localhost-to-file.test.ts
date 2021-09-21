import {downloadAndMapAssetsToFileUrl} from '../assets/download-and-map-assets-to-file';
import {fileNameInOs} from './os-file';

test('Should correctly map a localhost URL to an asset', async () => {
	expect(
		await downloadAndMapAssetsToFileUrl({
			localhostAsset: {
				type: 'video',
				src: 'http://localhost:3000/5f25ba62771d1f8195f858ec5ff8e8d6.mp4',
				id: '0.8331499681195862',
				frame: 2045,
				volume: 1,
				isRemote: false,
				mediaFrame: 2045,
				playbackRate: 1,
			},
			onDownload: () => undefined,
			webpackBundle:
				'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicstoSTC7',
			downloadDir:
				'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicstoSTC7',
		})
	).toEqual({
		type: 'video',
		src: fileNameInOs(
			'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicstoSTC7/5f25ba62771d1f8195f858ec5ff8e8d6.mp4'
		),
		id: '0.8331499681195862',
		frame: 2045,
		mediaFrame: 2045,
		volume: 1,
		isRemote: false,
		playbackRate: 1,
	});
});
