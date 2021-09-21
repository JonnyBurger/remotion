---
id: getrenderprogress
title: getRenderProgress()
slug: /lambda/getrenderprogress
---

Gets the current status of a render originally triggered via [`renderVideoOnLambda()`](/docs/lambda/rendervideoonlambda).

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import {getRenderProgress} from '@remotion/lambda';

// ---cut---

const progress = await getRenderProgress({
  renderId: 'd7nlc2y',
  bucketName: 'remotionlambda-d9mafgx',
  functionName: 'remotion-render-la8ffw',
  region: 'us-east-1'
})
```

## API

Call the function by passing an object with the following properties:

### `renderId`

The unique identifier for the render that you want to get the progress for. You can get the renderId from the return value of [`renderVideoOnLambda()`](/docs/lambda/rendervideoonlambda).

### `bucketName`

The bucket in which information about the render is saved. You can get the bucket name from the return value of [`renderVideoOnLambda()`](/docs/lambda/rendervideoonlambda).

### `region`

The region in which the Lambda function is located in.

### `functionName`

The name of the function that triggered the render.

## Response

Returns a promise resolving to an object with the following properties:

### `chunks`

How many chunks have been fully rendered so far.

### `done`

`true` if video has been successfully rendered and all processes are done. `false` otherwise.

### `encodingStatus`

Either `null` if not all chunks have been rendered yet or an object with the signature `{framesEncoded: number}` that tells how many frames have been stitched together so far in the concatenation process.

### `costs`

Non-binding information about how much the render is costing. At the moment the calculation is still very inaccurate (on the conservative size, probably shows higher cost than real).

### `renderId`

Mirrors the `renderId` that has been passed as an input

### `renderMetadata`

Contains the following information about the render:

- `totalFrames`: The duration of the video
- `startedDate`: Timestamp of when the rendering process started.
- `totalChunks`: Into how many pieces the rendering is divided.
- `estimatedLambdaInvokations`: The estimated amount of many Lambda functions get called in total, excluding calls to `getRenderProgress()`.
- `compositionId`: The ID of the composition that is being rendered.
- `codec`: The selected codec into which the video gets encoded.
- `usesOptimizationProfile`: If chunk optimization was applied to the render.

### `bucket`

Which bucket the render and other artifacts get saved.

### `outputFile`

`null` if the video is not yet rendered, a `string` containing a URL pointing to the final artifact if the video finished rendering.

### `timeToFinish`

`null` is the video is not yet rendered, a `number` describing how long the render took to finish in miliseconds.

### `errors`

An array which contains errors that occured.

### `fatalErrorEncountered`

`true` if an error occured and the video cannot be rendered. You should stop polling for progress and check the `errors` array.

### `currentTime`

The current time at which the Lambda function responded to the progress request.

### `bucketSize`

How many bytes have been saved to the S3 bucket as a result of this render.

### `lambdasInvoked`

How many lambdas that render a chunk have been invoked yet and have started rendering. Note that `lambdasInvoked` and `renderMetadata.estimatedLambdaInvokations` don't match up currently, this is expected.

### `estimatedPrice`

TODO

## See also

- [renderVideoOnLambda()](/docs/lambda/rendervideoonlambda)
