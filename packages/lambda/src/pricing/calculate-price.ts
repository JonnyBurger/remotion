import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateMemorySize} from '../shared/validate-memory-size';
import {AwsRegion} from './aws-regions';
import {pricing} from './price-per-1-s';

type EstimatePriceInput = {
	region: AwsRegion;
	durationInMiliseconds: number;
	memorySizeInMb: number;
};
/**
 *
 * @description Calculates the AWS costs incurred for AWS Lambda given the region, execution duration and memory size.
 * @link https://remotion.dev/docs/lambda/estimateprice
 * @returns `number` Price in USD
 */
export const estimatePrice = ({
	region,
	durationInMiliseconds,
	memorySizeInMb,
}: EstimatePriceInput) => {
	validateMemorySize(memorySizeInMb);
	validateAwsRegion(region);
	if (typeof durationInMiliseconds !== 'number') {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be a number but got ${typeof durationInMiliseconds}`
		);
	}

	if (Number.isNaN(durationInMiliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must not be NaN but it is.`
		);
	}

	if (!Number.isFinite(durationInMiliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be finite but it is ${durationInMiliseconds}`
		);
	}

	if (durationInMiliseconds < 0) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be over 0 but it is ${durationInMiliseconds}.`
		);
	}

	const timeCostDollars =
		Number(pricing[region]['Lambda Duration'].price) *
		((memorySizeInMb * durationInMiliseconds) / 1000 / 1024);

	const invocationCost = Number(pricing[region]['Lambda Requests'].price);

	return Number((timeCostDollars + invocationCost).toFixed(5));
};
