---
id: deployfunction
title: deployFunction()
slug: /lambda/deployfunction
---

Creates an [AWS Lambda](https://aws.amazon.com/lambda/) function in your AWS account that will be able to render a video in the cloud.

Before calling `deployFunction()`, you need to deploy the necessary binaries and obtain the identifier for the Lambda Layer. You can do so by calling [`ensureLambdaBinaries()`](/docs/lambda/ensurelambdabinaries).

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import {deployFunction, ensureLambdaBinaries} from '@remotion/lambda';

const {layerArn} = await ensureLambdaBinaries('us-east-1');
const {functionName} = await deployFunction({
  layerArn,
  region: 'us-east-1',
  timeoutInSeconds: 120,
  memorySizeInMb: 1024
});
console.log(functionName)
```

## Arguments

An object with the following properties:

### `layerArn`

The [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the Lambda Layer that should be used. You can obtain it by calling [`ensureLambdaBinaries()`](/docs/lambda/ensurelambdabinaries).

### `region`

The [AWS region](/docs/lambda/region-selection) which you want to deploy the Lambda function too. It must be the same region that your Lambda Layer resides in.

### `timeoutInSeconds`

How long the Lambda function may run before it gets killed. Must be below 900 seconds.
We recommend a timeout of 120 seconds or lower - remember, Remotion Lambda is the fastest if you render with a high concurrency. If your video takes longer to render, the concurrency should be increased rather than the timeout.

### `memorySizeInMb`

How many megabytes of RAM the Lambda function should have. By default we recommend a value of 1024MB. You may increase or decrease it depending on how memory-consuming your video is. The minimum allowed number is `512`, the maximum allowed number is `10240`. Since the costs of Remotion Lambda is directly proportional to the amount of RAM, we recommend to keep this amount as low as possible.

## Return value

An object with the following values:

- `functionName` (_string_): The name of the function just created.

## See also

- [deleteFunction()](/docs/lambda/deletefunction)
- [getFunctions()](/docs/lambda/getfunctions)
