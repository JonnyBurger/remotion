import {getUserPolicy} from '../../../api/iam-validation/suggested-policy';
import {Log} from '../../log';

export const USER_SUBCOMMAND = 'user';

export const userSubcommand = () => {
	Log.info(getUserPolicy());
};
