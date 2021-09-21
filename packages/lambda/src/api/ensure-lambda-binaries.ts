import {
	LambdaClient,
	LayersListItem,
	ListLayersCommand,
	PublishLayerVersionCommand,
} from '@aws-sdk/client-lambda';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {CURRENT_VERSION, getBinariesBucketName} from '../shared/constants';

const runtimes: string[] = ['nodejs14.x', 'nodejs12.x', 'nodejs10.x'];

const LAYER_NAME = 'remotion-binaries';

const createLayer = ({
	region,
	name,
	key,
	sourceS3Bucket,
}: {
	region: AwsRegion;
	name: string;
	key: string;
	sourceS3Bucket: string;
}) => {
	return getLambdaClient(region).send(
		new PublishLayerVersionCommand({
			Content: {
				S3Bucket: sourceS3Bucket,
				S3Key: key,
			},
			LayerName: name,
			LicenseInfo:
				'https://ffmpeg.org/legal.html / https://chromium.googlesource.com/chromium/src/+/refs/heads/main/LICENSE',
			CompatibleRuntimes: runtimes,
			Description: CURRENT_VERSION,
		})
	);
};

const getLayers = async (lambdaClient: LambdaClient) => {
	const data = await lambdaClient.send(
		new ListLayersCommand({
			CompatibleRuntime: runtimes[0],
		})
	);
	return (data.Layers || []) as LayersListItem[];
};

const hasLayer = (name: string, layers: LayersListItem[]) => {
	return layers.find(
		(l) =>
			l.LayerName === name &&
			l.LatestMatchingVersion?.Description === CURRENT_VERSION
	);
};

const ensureLayer = async ({
	layers,
	region,
}: {
	region: AwsRegion;
	layers: LayersListItem[];
}): Promise<string> => {
	const existingLayer = hasLayer(LAYER_NAME, layers);
	if (existingLayer) {
		return existingLayer.LatestMatchingVersion?.LayerVersionArn as string;
	}

	const layer = await createLayer({
		name: LAYER_NAME,
		key: 'remotion.zip',
		sourceS3Bucket: getBinariesBucketName(region),
		region,
	});
	return layer.LayerVersionArn as string;
};

/**
 * @description Ensures that a Lambda layer with the necessary binaries exists.
 * @link https://remotion.dev/docs/lambda/ensurelambdabinaries
 * @param {AwsRegion} region The region in which you want ensure the binaries are deployed.
 * @returns `Promise<{layerArn: string}>`
 */
export const ensureLambdaBinaries = async (region: AwsRegion) => {
	const layers = await getLayers(getLambdaClient(region));
	const layerArn = await ensureLayer({layers, region});

	return {layerArn};
};
