---
id: ensurelambdabinaries
title: ensureLambdaBinaries()
slug: /lambda/ensurelambdabinaries
---

Ensures that a [Lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) with the necessary binaries exists.

The Remotion lambda layer contains the binaries for FFMPEG and Chromium and is necessary for Remotion Lambda to work.

The binaries are downloaded from a Remotion-hosted S3 bucket and copied into your AWS account.

The binaries are hosted at the following URL:

```
https://lambda-remotion-binaries-<any-s3-region>.s3.<any-s3-region>.amazonaws.com/remotion.zip
```

This value is hardcoded into the `ensureLambdaBinaries()` function - you only need to call it.

## Example

```ts twoslash
// @module: esnext
// @target: es2017
import {ensureLambdaBinaries} from '@remotion/lambda';

// ...

const {layerArn} = await ensureLambdaBinaries('us-east-1');
console.log(layerArn)
```

## Arguments

### `region`

The AWS region in which you would like to install the binaries. You have to install the binaries separately for each region that you would like to use Remotion Lambda.

## Return value

An object with the following keys:

- `layerArn` _(string)_: The [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the layer that has been created, or if one has already existed, the ARN of the existing layer.
