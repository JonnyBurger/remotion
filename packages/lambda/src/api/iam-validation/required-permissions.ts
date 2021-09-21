import {iam, lambda, s3} from 'aws-policies';
import {
	BINARIES_BUCKET_PREFIX,
	REMOTION_BUCKET_PREFIX,
	RENDER_FN_PREFIX,
} from '../../shared/constants';

// TODO: Update docs before release
export const requiredPermissions: {
	actions: (s3 | iam | lambda)[];
	resource: string[];
}[] = [
	{
		actions: [iam.GetUser],
		// eslint-disable-next-line no-template-curly-in-string
		resource: ['arn:aws:iam::*:user/${aws:username}'],
	},
	{
		actions: [iam.SimulatePrincipalPolicy],
		resource: ['*'],
	},
	{
		// TODO: arn:aws:iam::976210361945:role/lambda-admin, can it be locked down more?
		actions: [iam.PassRole],
		resource: ['*'],
	},
	{
		actions: [
			s3.GetObject,
			s3.DeleteObject,
			s3.DeleteBucket,
			s3.PutBucketWebsite,
			s3.DeleteBucketWebsite,
			s3.PutObjectAcl,
			s3.PutObject,
			s3.GetBucketLocation,
		],
		resource: [`arn:aws:s3:::${REMOTION_BUCKET_PREFIX}*`],
	},
	{
		// To download layers
		actions: [s3.GetObject],
		resource: [`arn:aws:s3:::${BINARIES_BUCKET_PREFIX}*`],
	},
	{
		actions: [s3.CreateBucket, s3.ListBucket, s3.PutBucketAcl],
		resource: [`arn:aws:s3:::*`],
	},
	{
		actions: [s3.ListAllMyBuckets],
		resource: ['*'],
	},
	{
		actions: [
			lambda.GetFunction,
			lambda.InvokeAsync,
			lambda.InvokeFunction,
			lambda.CreateFunction,
			lambda.DeleteFunction,
		],
		resource: [`arn:aws:lambda:*:*:function:${RENDER_FN_PREFIX}*`],
	},
	{
		actions: [lambda.PublishLayerVersion],
		resource: ['arn:aws:lambda:*:*:layer:remotion-binaries'],
	},
	{
		actions: [lambda.DeleteLayerVersion, lambda.GetLayerVersion],
		resource: ['arn:aws:lambda:*:*:layer:*:*'],
	},
	{
		actions: [lambda.ListLayers, lambda.ListFunctions],
		resource: ['*'],
	},
];
