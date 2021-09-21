---
id: getfunctioninfo
title: getFunctionInfo()
slug: /lambda/getfunctioninfo
---

Gets information about a function given it's name and region.

To get a list of deployed functions, use [`getFunctions()`](/docs/lambda/getfunctions).

To deploy a function, use [`deployFunction()`](/docs/lambda/deployfunction).

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import {getFunctionInfo} from '@remotion/lambda';

const info = await getFunctionInfo({
  functionName: 'remotion-render-d7nd2a9f',
  region: 'eu-central-1'
});
console.log(info.functionName) // remotion-render-d7nd2a9f
console.log(info.memorySizeInMb) // 1500
console.log(info.version) // '2021-07-14'
console.log(info.timeoutInSeconds) // 120
```

## Arguments

An object containing the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) the function resides in.

### `functionName`

The name of the function.

## Return value

A promise resolving to an object with the following properties:

### `memorySizeInMb`

The amount of memory allocated to the function.

### `functionName`

The name of the function.

### `version`

The version of the function. Remotion is [versioning](/docs/lambda/changelog) the Lambda function and a render can only be triggered from a version of `@remotion/lambda` that is matching the one of the function.

### `timeoutInSeconds`

The timeout that has been assigned to the Lambda function.

## See also

- [`getFunctions()`](/docs/lambda/getfunctions)
- [`deployFunction()`](/docs/lambda/deployfunction)
- [`deleteFunction()`](/docs/lambda/deletefunction)
