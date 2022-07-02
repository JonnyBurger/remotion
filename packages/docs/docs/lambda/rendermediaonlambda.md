---
id: rendermediaonlambda
title: renderMediaOnLambda()
---

import { MinimumFramesPerLambda } from "../../components/lambda/default-frames-per-lambda";

Triggers a render on a lambda given a composition and a lambda function.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { renderMediaOnLambda } from "@remotion/lambda";
// ---cut---

const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  framesPerLambda: 20,
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  inputProps: {},
  codec: "h264-mkv",
  imageFormat: "jpeg",
  maxRetries: 1,
  privacy: "public",
});
```

## Arguments

An object with the following properties:

### `region`

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `privacy`

Either `"public"` or `"private"`, determining whether the video can be seen by anyone after it's uploaded to the S3 bucket.

### `functionName`

The name of the deployed Lambda function.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `framesPerLambda`

The video rendering process gets distributed across multiple Lambda functions. This setting controls how many frames are rendered per Lambda invocation. The lower the number you pass, the more Lambdas get spawned.

Default value: [Dependant on video length](/docs/lambda/concurrency)  
Minimum value: <MinimumFramesPerLambda />

:::note
The `framesPerLambda` parameter cannot result in more than 200 functions being spawned. See: [Concurrency](/docs/lambda/concurrency)
:::

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/lambda/deploysite) to deploy a Remotion project.

### `composition`

The name of the [composition](/docs/composition) you want to render.

### `inputProps`

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `codec`

Which codec should be used to encode the video. At the moment the only supported video codec is `h264-mkv`, which will return a MP4 encoded using H.264, but where the chunks are encoded in the Matruska container. The reason Lambda has a special value is to allow audio to be stitched together seamlessly.

Audio codecs `mp3`, `aac` and `wav` are also supported.

See also [`renderMedia() -> codec`](/docs/renderer/render-media#codec).

### `imageFormat`

See [`renderMedia() -> imageFormat`](/docs/renderer/render-media#imageformat).

### `crf`

See [`renderMedia() -> crf`](/docs/renderer/render-media#crf).

### `envVariables`

See [`renderMedia() -> envVariables`](/docs/renderer/render-media#envvariables).

### `pixelFormat`

See [`renderMedia() -> pixelFormat`](/docs/renderer/render-media#pixelformat).

### `proResProfile`

See [`renderMedia() -> proResProfile`](/docs/renderer/render-media#proresprofile).

### `quality`

See [`renderMedia() -> quality`](/docs/renderer/render-media#quality).

### `maxRetries`

_optional, default `1`_

How often a chunk may be retried to render in case the render fails.
If a rendering of a chunk is failed, the error will be reported in the [`getRenderProgress()`](/docs/lambda/getrenderprogress) object and retried up to as many times as you specify using this option.

### `outName`

_optional_

The file name of the media output.

It can either be:

- `undefined` - it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`. The outName must match `/^([0-9a-zA-Z-!_.*'()/]+)$/g`.
- A `string` - it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`.
- An object of shape `{ key: string; bucketName: string }`. This will save the render to an arbitrary bucket with an arbitrary key. Note the following restrictions:
  - You must extend the default Remotion policy to allow read and write access to that bucket.
  - The bucket must be in the same region.
  - When calling APIs such as `downloadMedia()` or `getRenderProgress()`, you must pass the bucket name where the site resides in, not the bucket where the video gets saved.
  - The `key` must match `/^([0-9a-zA-Z-!_.*'()]+)$/g` and the bucketName must match `/^(?=^.{3,63}$)(?!^(\d+\.)+\d+$)(^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$)/`.

### `timeoutInMilliseconds?`

_optional_

A number describing how long the render may take to resolve all `delayRender()` calls before it times out. Default: `30000`

### `chromiumOptions?`

_optional, available from v2.6.5_

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](/docs/chromium-flags).

#### `disableWebSecurity`

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors`

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones, being ignored.

#### `gl`

_string_

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromiums default

:::note
The default for Lambda is `swangle`, but `null` elsewhere.
:::

## Return value

Returns a promise resolving to an object containing two properties: `renderId` and `bucketName`. Those are useful for passing to `getRenderProgress()`

### `renderId`

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the S3 bucket.

### `bucketName`

The S3 bucket name in which all files are being saved.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-media-on-lambda.ts)
- [getRenderProgress()](/docs/lambda/getrenderprogress)
