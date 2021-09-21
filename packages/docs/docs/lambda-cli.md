---
id: lambda-cli
sidebar_label: CLI
title: "@remotion/lambda - CLI"
slug: /lambda/cli
---

You can get a list of all commands using `npx remotion lambda --help`.

## Global options

### `--region`

Selects an AWS region: For example:

```console
--region=eu-central-1
```

The default region is `us-east-1`. You may also set a `AWS_REGION` environment variable directly or via `.env` file.

### `--yes`, `-y`

Skips confirmation when doing a destructive action.

## sites

### create

Uploads a Remotion project to an S3 bucket. You will get a URL which you can pass to the `render` command to render the video.

```console
npx remotion lambda sites create src/index.ts
```

### ls

Lists the sites uploaded to the S3 buckets

```console
npx remotion lambda sites ls
```

### rm

Deletes a site from an S3 bucket.

```console
npx remotion lambda sites rm f87nffa
```

## policies

Deals with AWS policy documents, generating and validating policies that need to be added to the account.

### user

Print the suggested policy to be applied to the user that is attached to the access token.

```
npx remotion lambda policies user
```

### role

Print the suggested policy to be applied to the role that is attached to the lambda function.

```
npx remotion lambda policies role
```

### validate

Validate the current policies setup is correct by running tests using the AWS policy simulator.

```
npx remotion lambda policies validate
```

## render

Renders a video using Remotion Lambda. You need to pass two arguments:

- A URL, obtained from the `sites create` command.
- The ID of the composition that you want to render.

```
npx remotion lambda render https://remotionlambda-abcdefgh.s3.eu-central-1.amazonaws.com/sites/abcdefgh HelloWorld
```

## still

Renders a still frame using Remotion Lambda. You need to pass two arguments:

- A URL, obtained from the `sites create` command.
- The ID of the composition that you want to render.

```
npx remotion lambda still https://remotionlambda-abcdefgh.s3.eu-central-1.amazonaws.com/sites/abcdefgh HelloWorld
```

## functions

### deploy

Deploys a Remotion render lambda function to your account. You only need 1 function to render videos.

```
npx remotion lambda functions deploy
```

### ls

List the functions deployed to your AWS account.

```console
npx remotion lambda functions ls
```

### rm

Removes a render function from your AWS account.

```console
npx remotion lambda functions rm remotion lambda-4y2y1aaf
```

## cleanup

This command helps remove Remotion-related resources from your AWS account.

```
npx remotion lambda cleanup
```
