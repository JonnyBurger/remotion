import LambdaFS from 'lambdafs';

if (
	/^AWS_Lambda_nodejs(?:10|12|14)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	) === true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/tmp/aws';
	}

	if (process.env.LD_LIBRARY_PATH === undefined) {
		process.env.LD_LIBRARY_PATH = '/tmp/aws/lib';
	} else if (process.env.LD_LIBRARY_PATH.startsWith('/tmp/aws/lib') !== true) {
		process.env.LD_LIBRARY_PATH = [
			...new Set(['/tmp/aws/lib', ...process.env.LD_LIBRARY_PATH.split(':')]),
		].join(':');
	}
}

export const executablePath = async (): Promise<string> => {
	const promises = [
		LambdaFS.inflate('/opt/bin/chromium.br'),
		LambdaFS.inflate('/opt/bin/swiftshader.tar.br'),
		LambdaFS.inflate('/opt/bin/aws.tar.br'),
	];

	const result = await Promise.all(promises);
	return result[0];
};
