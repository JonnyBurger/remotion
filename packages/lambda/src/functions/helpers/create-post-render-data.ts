import {_Object} from '@aws-sdk/client-s3';
import {AwsRegion} from '../..';
import {estimatePrice} from '../../pricing/calculate-price';
import {
	lambdaTimingsPrefix,
	PostRenderData,
	RenderMetadata,
} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {getFilesToDelete} from './get-files-to-delete';
import {inspectErrors} from './inspect-errors';

const OVERHEAD_TIME_PER_LAMBDA = 100;

export const createPostRenderData = async ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	memorySizeInMb,
	renderMetadata,
	contents,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
	renderMetadata: RenderMetadata;
	contents: _Object[];
}) => {
	const initializedKeys = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(renderId))
	);

	const parsedTimings = initializedKeys.map(({Key}) =>
		parseLambdaTimingsKey(Key as string)
	);

	const times = parsedTimings
		.map((p) => p.end - p.start + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b);

	const cost = estimatePrice({
		durationInMiliseconds: times,
		memorySizeInMb,
		region,
	});

	const outputFile = findOutputFileInBucket({
		contents,
		bucketName,
		renderId,
		renderMetadata,
		type: 'video',
	});

	if (!outputFile) {
		throw new Error('Cannot wrap up without an output file in the S3 bucket.');
	}

	const errorExplanations = await inspectErrors({
		contents,
		renderId,
		bucket: bucketName,
		region,
		expectedBucketOwner,
	});

	const endTime = Date.now();
	const startTime = renderMetadata.startedDate;
	const timeToFinish = endTime - startTime;

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const data: PostRenderData = {
		cost: {
			currency: 'USD',
			disclaimer:
				'Estimated cost for lambda invocations only. Does not include cost for S3 storage and data transfer.',
			estimatedCost: cost,
			estimatedDisplayCost: new Intl.NumberFormat('en-US', {
				currency: 'USD',
				currencyDisplay: 'narrowSymbol',
			}).format(cost),
		},
		outputFile: outputFile.url,
		timeToFinish,
		errors: errorExplanations,
		startTime: renderMetadata.startedDate,
		endTime,
		outputSize: outputFile.size,
		bucketSize,
		renderMetadata,
		filesCleanedUp: getFilesToDelete({
			chunkCount: renderMetadata.totalChunks,
			renderId,
		}).length,
	};

	return data;
};
