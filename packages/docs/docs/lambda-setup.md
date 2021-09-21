---
id: lambda-setup
title: Setup
slug: /lambda/setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 1. Install `@remotion/lambda`

Check the newest version number in the #lambda Discord channel

```
npm i @remotion/lambda@<version-number>
```

Also update **all the other Remotion packages** to have the same version: `remotion`, `@remotion/cli`, `@remotion/bundler` Make sure no package version number has a `^` character in front of it as it will install a different version.

Your package.json should look like the following:

```json
  "@remotion/bundler": "2.4.0-alpha.[versionhash]",
  "@remotion/cli": "2.4.0-alpha.[versionhash]",
  "@remotion/lambda": "2.4.0-alpha.[versionhash]",
  // ...
  "remotion": "2.4.0-alpha.[versionhash]",
```

## 2. Create role policy

- Go to AWS account IAM section
- Create a new policy
- Click on JSON
- Type in `npx remotion lambda policies role` and copy it into the JSON field
- Go to tags, no tags are needed
- Give the policy the name `remotion-lambda-policy`!

## 3. Create a role

- Go to AWS account IAM section
- Create a new role
- Use case: Select `Lambda`
- Click next
- Attach permissions role: `remotion-lambda-policy`
- Permissions boundary: Skip it
- Tags: Skip it
- Role name: Name it `remotion-lambda-role` exactly!

## 4. Create an user

- Click `Create user`
- Select any username
- Programmatic access = YES
- Management console access = NO
- Click next
- Tags: Skip
- Click "Create user"
- Copy Access key ID and Secret Access Key
- Add a `.env` file to your project

```txt title=".env"
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=xxx
```

## 5. Add permissions to your user

- Click on your user
- Click "Add inline policy"
- Click JSON
- Enter in your terminal: `npx remotion lambda policies user` and copy it in
- Give the policy a name, can be anything
- Click "Create policy"

## 6. Optional: Validate the permission setup

- Run `npx remotion lambda policies validate`

<hr/>

For the following steps, you may execute them on the CLI, or programmatically using the Node.JS APIs.

## 7. Deploy a function

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Deploy a function by executing the following command:

```bash
npx remotion lambda functions deploy
```

</TabItem>
<TabItem value="node">

First create a Lambda layer - it will contain the necessary binaries such as Google Chrome and FFMPEG. If one already exists, it will be used instead.

We'll assume `us-east-1`, but you can choose [any supported region](/docs/lambda/region-selection).

```ts twoslash
// @module: ESNext
// @target: ESNext
import {ensureLambdaBinaries, deployFunction} from '@remotion/lambda';

const {layerArn} = await ensureLambdaBinaries('us-east-1')
```

Now you are ready to deploy the function itself using [`deployFunction()`](/docs/lambda/deployfunction).

```ts twoslash
// @module: ESNext
// @target: ESNext
import {ensureLambdaBinaries, deployFunction} from '@remotion/lambda';

const {layerArn} = await ensureLambdaBinaries('us-east-1')

// ---cut---
const {functionName} = await deployFunction({
  layerArn,
  region: 'us-east-1',
  timeoutInSeconds: 120,
  memorySizeInMb: 1536
})
```

The function name is returned which you'll need for rendering.
</TabItem>
</Tabs>

## 8. Deploy a website

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Run the following command to deploy your Remotion project to an S3 bucket. Pass as the last argument the entry file of the project - this is the file where [`registerRoot()`](/docs/register-root) is called.

```bash
npx remotion lambda sites create src/index.tsx
```

A URL will be printed pointing to the deployed project.

</TabItem>
<TabItem value="node">

First, you need to create an S3 bucket in your preferred region. If one already exists, it will be used instead:

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from 'path';
import {deploySite, getOrCreateBucket} from '@remotion/lambda';

const {bucketName} = await getOrCreateBucket({
  region: 'us-east-1'
})
```

Next, upload your Remotion project to an S3 bucket. Specify the entry point of your Remotion project, this is the file where [`registerRoot()`](/docs/register-root) is called.

```ts twoslash
// @module: ESNext
// @target: ESNext
import path from 'path';
import {deploySite, getOrCreateBucket} from '@remotion/lambda';

const {bucketName} = await getOrCreateBucket({
  region: 'us-east-1'
})
// ---cut---
const {url} = await deploySite({
  bucketName,
  entryPoint: path.resolve(process.cwd(), 'src/index.tsx'),
  region: 'us-east-1'
})
```

You are now ready to render a video.

</TabItem>
</Tabs>

## 9. Render a video

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'node', },
]
}>
<TabItem value="cli">

Take the URL you received from the previous step and run the following command. Also pass in the ID of the composition you'd like to render.

```bash
npx remotion lambda render <serve-url> <composition-id>
```

Progress will be printed until the video finished rendering. Congrats! You rendered your first video using Remotion Lambda 🚀

</TabItem>
<TabItem value="node">

You already have the function name from a previous step. But since you only need to deploy a function once, it's useful to retrieve the name of your deployed function programmatically before rendering a video in case your Node.JS program restarts. We can call [`getFunctions()`](/docs/lambda/getfunctions) with the `compatibleOnly` flag to get only functions with a matching version.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {getFunctions, renderVideoOnLambda, getRenderProgress} from '@remotion/lambda';

const functions = await getFunctions({
  region: 'us-east-1',
  compatibleOnly: true
})

const functionName = functions[0].functionName
```

We can now trigger a render using the [`renderVideoOnLambda()`](/docs/lambda/rendervideoonlambda) function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {getFunctions, renderVideoOnLambda, getRenderProgress} from '@remotion/lambda';

const url = 'string'
const functions = await getFunctions({
  region: 'us-east-1',
  compatibleOnly: true
})

const functionName = functions[0].functionName
// ---cut---

const {renderId, bucketName} = await renderVideoOnLambda({
  region: 'us-east-1',
  functionName,
  serveUrl: url,
  composition: 'HelloWorld',
  inputProps: {},
  codec: 'h264-mkv',
  imageFormat: 'jpeg',
  maxRetries: 3
})
```

The render will now run and after a while the video will be available in your S3 bucket. You can at any time get the status of the video render by calling [`getRenderProgress()`](/docs/lambda/getrenderprogress).

```ts twoslash
// @module: ESNext
// @target: ESNext
import {getFunctions, renderVideoOnLambda, getRenderProgress} from '@remotion/lambda';

const url = 'string'
const functions = await getFunctions({
  region: 'us-east-1',
  compatibleOnly: true
})

const functionName = functions[0].functionName

const {renderId, bucketName} = await renderVideoOnLambda({
  region: 'us-east-1',
  functionName,
  serveUrl: url,
  composition: 'HelloWorld',
  inputProps: {},
  codec: 'h264-mkv',
  imageFormat: 'jpeg',
  maxRetries: 3
})
// ---cut---
while (true) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName,
    region: 'us-east-1'
  })
  if (progress.done) {
    console.log('Render finished!', progress.outputFile)
    process.exit(0)
  }
  if (progress.fatalErrorEncountered) {
    console.error('Error enountered', progress.errors)
    process.exit(1)
  }
}
```

This code will poll every second to check the progress of the video and exit the script if the render is done. Congrats! You rendered your first video using Remotion Lambda 🚀

</TabItem>
</Tabs>
