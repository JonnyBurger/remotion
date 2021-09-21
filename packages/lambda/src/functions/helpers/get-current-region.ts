import {AwsRegion} from '../../pricing/aws-regions';
import {isInLambda} from '../../shared/tmpdir';

export const getCurrentRegionInFunction = () => {
	if (!isInLambda) {
		throw new Error(
			'Should not call getCurrentRegion() if not inside a lambda function'
		);
	}

	if (!process.env.AWS_REGION) {
		throw new Error('Expected process.env.AWS_REGION to be defined');
	}

	return process.env.AWS_REGION as AwsRegion;
};
