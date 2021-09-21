---
id: lambda-region-selection
title: Region selection
slug: /lambda/region-selection
---

import {LambdaRegionList} from '../components/lambda/regions.tsx';

Before starting with Remotion Lambda, you need to think about into which AWS region you are deploying your function and bucket.

This document explains how to select a region and which considerations you need to make.

## Available regions

The following AWS regions are available:

<LambdaRegionList />

## Default region

The default region is `us-east-1`.

## Selecting a region

There are 3 ways of selection a region:

- When using the Node.JS APIs, you have to pass the region explicitly to each function. Make sure your projects satisfy the Typescript types or follow the documentation.

- When using the CLI, you can set the region using the `AWS_REGION` environment variable. It's best to put it in a `.env` file so you don't forget it sometimes.

:::info
The AWS_REGION environment variable does not work when using the Node.JS APIs.
:::

- You can also pass the `--region` flag to all CLI commands to override the region. The flag takes precedence over the environment variable.

If you don't set a region, Remotion will use the default region.

## Which region should I choose?

Note that different regions have a different limit on how many Lambda functions can be started in a short amount of time [("burst limit")](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html).

- `us-east-1`, `us-west-2`, `eu-west-1`: Burst concurrency = 3000
- `ap-northeast-1`, `eu-central-1`, `us-east-2`: Burst concurrency = 1000
- All other regions = 500

**Because of this, we recommend hosting your infrastructure in `us-east-1`, `us-west-2` or `eu-west-1` for maximum scalability.**

## Other considerations

- The function and S3 bucket must be in the same region to eliminate latency across datacenters. Rendering with functions and buckets that ahave mismatching regions is not supported

- You may deploy your whole architecture to different regions to further increase the amount of renders you can make concurrently. The tradeoff is higher redundancy, and not being able to benefit less from already warm functions and chunk optimization.

- Some regions are more expensive than others (for example `af-south-1`).
  Consult the [Lambda Pricing page](https://aws.amazon.com/lambda/pricing/) from AWS.

- Some regions [are disabled by default](https://docs.aws.amazon.com/general/latest/gr/rande-manage.html) and you need to enable them in your AWS account before you can use them.
