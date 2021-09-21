import {GetUserCommand} from '@aws-sdk/client-iam';
import {AwsRegion} from '../pricing/aws-regions';
import {getIamClient} from './aws-clients';
import {validateAwsRegion} from './validate-aws-region';

export const getAccountId = async (options: {region: AwsRegion}) => {
	validateAwsRegion(options.region);

	const user = await getIamClient(options.region).send(new GetUserCommand({}));
	const accountId = user.User?.Arn?.match(/aws:iam::([0-9]+)/);

	if (!accountId) {
		throw new Error('Cannot get account ID');
	}

	return accountId;
};
