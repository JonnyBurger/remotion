---
id: lambda
sidebar_label: Overview
title: "@remotion/lambda"
---

:::warning
**Highly experimental**: APIs might undergo major changes and the framework still has rough edges and hardcoded values - see known issues section. Updates will be provided on the #lambda channel on Discord.

**No release timeline**: The project is in active development but will not be rushed to a release but instead we want to ensure it's futureproof.
:::

## How it works

- A lambda function and a S3 bucket is created on AWS.
- A Remotion project gets deployed to a S3 bucket as a website.
- The lambda function can invoke a render.
- A lot of lambda functions are created in parallel which each render a small part of the video
- The initial lambda function downloads the videos and stitches them together.
- The final video gets uploaded to S3 and is available for download.

## Architecture

- **Lambda function**: Requires a layer with Google Chrome and FFMPEG, is currently pulled from a central S3 bucket. Only one lambda function is required, but it can execute different actions.
- **S3 bucket**: Stores the projects, the renders, render metadata and chunk optimization data.
- **CLI**: Allows to control the overall architecture from the command line. Is installed by adding `@remotion/lambda` to a project.
- **Node.JS API**: Has the same features as the CLI but is easier to use programmatically

## Setup / Installation

[**See here**](/docs/lambda/setup)

## Considerations

Currently hardcoded but you will need to decide in the future:

- Decide memory limit
- Decide lambda timeout
- Decide parallelism

## Region selection

Starting from release `2.2.0-alpha.6c60bafb`, you can select an AWS region (previously `eu-central-1` was hardcoded) using the `AWS_REGION` environment variable. The default value is `us-east-1`.

In this release, a new `s3:GetBucketRegion` permission is needed, so you need to do [update the permissions](/docs/lambda/setup).

The following regions are available for Remotion Lambda:

- `us-east-1`
- `us-east-2`
- `us-west-1`
- `us-west-2`
- `af-south-1`
- `ap-east-1`
- `ap-south-1`
- `ap-northeast-3`
- `ap-northeast-2`
- `ap-southeast-1`
- `ap-southeast-2`
- `ap-northeast-1`
- `ca-central-1`
- `eu-central-1`
- `eu-west-1`
- `eu-west-2`
- `eu-south-1`
- `eu-west-3`
- `eu-north-1`
- `me-south-1`
- `sa-east-1`

## Limitations

- You only have 512MB of storage available in lambda function. This must be sufficient for both the chunks and the output, therefore the output file can only be about ~250MB maximum.
- Lambda has a global limit of 1000 concurrent lambdas per region by default, although it can be increased.

## Cost

Will be estimated automatically and added to the progress response. Currently not very accurate/sophisticated.

## Chunk optimization

A mechanism that determines after a render which frames rendered the slowest optimizes the batching sizes for the next render. This can optimize subsequent render times by up to 50%.

## AWS permissions

[**See here**](/docs/lambda/permissions)

## CLI

[**See here**](/docs/lambda/cli)

## Node.JS API

Everything you can do using the CLI, you can also control using Node.JS APIs. Refer to the left sidebar to see the list of available APIs.

## Known issues

- [ ] Sometimes an error `Unable to spawn browser` is shown - you can ignore it
- [ ] AWS permissions are looser than necessary
- [ ] Permission validation command sometimes breaks
- [ ] Costs are not calculated accurately (probably slightly higher than effective)
- [ ] Rendering using more than 1000 chunks is undefined behavior, things will break
- [ ] There is no way to disable chunk optimization

## License

The standard Remotion license applies. https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

Companies need to buy 1 cloud rendering seat per 2000 renders per month - see https://companies.remotion.dev/
