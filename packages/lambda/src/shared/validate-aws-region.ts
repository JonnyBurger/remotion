import {AwsRegion, AWS_REGIONS} from '../pricing/aws-regions';

export function validateAwsRegion(
	region: unknown
): asserts region is AwsRegion {
	if (!AWS_REGIONS.includes(region as AwsRegion)) {
		throw new TypeError(
			`${region} is not a valid AWS region. Must be one of: ${AWS_REGIONS.join(
				', '
			)}`
		);
	}
}
