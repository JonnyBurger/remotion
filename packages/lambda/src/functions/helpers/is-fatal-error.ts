import {LambdaErrorInfo} from './write-lambda-error';

export const isFatalError = (err: LambdaErrorInfo) => {
	return err.isFatal;
};
