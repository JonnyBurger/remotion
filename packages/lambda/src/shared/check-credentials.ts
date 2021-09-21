const messageForVariable = (variable: string) =>
	`You have tried to call a Remotion Lambda function, but have not set the environment variable ${variable}. Please refer to the Remotion Lambda docs to see how to generate the credentials for your AWS account and then set the environment variables. Environment variables from a '.env' file are not automatically read if you are calling the Node.JS APIs, in that case you need to read the .env file yourself using the 'dotenv' package.`;

// TODO: Could better differentiate between CLI and Node.JS acccess.
export const checkCredentials = () => {
	if (!process.env.AWS_ACCESS_KEY_ID) {
		throw new Error(messageForVariable('AWS_ACCESS_KEY_ID'));
	}

	if (!process.env.AWS_SECRET_ACCESS_KEY) {
		throw new Error(messageForVariable('AWS_SECRET_ACCESS_KEY'));
	}
};
