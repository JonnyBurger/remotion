import {
	GetUserCommand,
	SimulatePrincipalPolicyCommand,
} from '@aws-sdk/client-iam';
import {iam} from 'aws-policies';
import {AwsRegion} from '../../pricing/aws-regions';
import {getIamClient} from '../../shared/aws-clients';

export type EvalDecision = 'allowed' | 'explicitDeny' | 'implicitDeny';

export type SimulationResult = {
	decision: EvalDecision;
	name: string;
};

export const simulateRule = async (options: {
	region: AwsRegion;
	actionNames: string[];
	arn: string;
	resource: string[];
}): Promise<SimulationResult[]> => {
	if (options.actionNames.includes(iam.GetUser)) {
		try {
			await getIamClient(options.region).send(new GetUserCommand({}));
			const result: SimulationResult[] = [
				{
					decision: 'allowed',
					name: iam.GetUser,
				},
			];
			return result;
		} catch (err) {
			const result: SimulationResult[] = [
				{
					decision: 'explicitDeny',
					name: iam.GetUser,
				},
			];
			return result;
		}
	}

	const res = await getIamClient(options.region).send(
		new SimulatePrincipalPolicyCommand({
			ActionNames: options.actionNames,
			PolicySourceArn: options.arn,
			ResourceArns: options.resource,
		})
	);

	return (res.EvaluationResults ?? []).map((pol): SimulationResult => {
		return {
			decision: pol.EvalDecision as EvalDecision,
			name: pol.EvalActionName as string,
		};
	});
};
