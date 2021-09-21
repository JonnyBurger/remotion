import {getAccountId as original} from '../get-account-id';

export const getAccountId: typeof original = () => {
	const accountId = 'aws:iam::123456789'.match(/aws:iam::([0-9]+)/);
	if (!accountId) {
		throw new Error('Cannot get account ID');
	}

	return Promise.resolve(accountId);
};
