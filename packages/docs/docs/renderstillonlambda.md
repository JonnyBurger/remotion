---
id: renderstillonlambda
title: renderStillOnLambda()
slug: /lambda/renderstillonlambda
---

Renders a still image inside a lambda function and writes it to the specified output location.

If you want to render a video instead, use [`renderVideoOnLamda()`](/docs/lambda/rendervideoonlambda) instead.

If you want to render a still locally instead, use [`renderStill()`](/docs/render-still) instead.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import {renderStillOnLambda} from '@remotion/lambda';
// ---cut---

const {
  estimatedPrice,
  url,
  size
} = await renderStillOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  composition: 'MyVideo',
  inputProps: {},
  imageFormat: 'png',
  maxRetries: 3,
  privacy: 'public',
  envVariables: {},
  frame: 10
})
```

## Arguments

An object with the following properties:

### `region`

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `functionName`

The name of the deployed Lambda function.
Use [`deployFunction()`](/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `serveUrl`

A URL pointing to a Remotion project. Use [`deploySite()`](/docs/lambda/deploysite) to deploy a Remotion project.

### `composition`

The name of the [composition](/docs/composition) you want to render..

### `inputProps`

React props that are passed to your composition. You define the shape of the props that the component accepts.

### `privacy`

Whether the output in the S3 bucket should be public or private. Either `"private"` or `"public"`.

### `frame`

_optional - default `0`_

Which frame of the composition should be rendered.

### `imageFormat?`

_optional - default `"png"`_

The image format that you want - either `"png"` or `"jpeg"`.

### `quality?`

_optional_

Sets the quality of the generate JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `"jpeg"`, otherwise this option is invalid.

### `maxRetries?`

_optional - default `3`_

How often a frame render may be retried until it fails.

### `envVariables?`

_optional - default `{}`_

See [`renderFrames() -> envVariables`](/docs/render-frames#envvariables).

## Return value

Returns a promise resolving to an object with the following properties:

### `bucketName`

The S3 bucket in which the video was saved.

### `output`

An AWS S3 URL where the output is available.

### `estimatedPrice`

Object containing roughly estimated information about how expensive this operation was.

### `size`

The size of the output image in bytes.

## See also

- [renderVideoOnLambda()](/docs/lambda/rendervideoonlambda)
- [renderStill()](/docs/render-still)
