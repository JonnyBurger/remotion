---
title: getFunctions()
id: getfunctions
slug: /lambda/getfunctions
---

Retrieves a list of functions that Remotion deployed to AWS Lambda in a certain region.

The parameter `compatibleOnly` determines whether only functions that are compatible with the installed version of Remotion Lambda should be returned.

To get information about only a single function, use [`getFunctionInfo()`](/docs/lambda/getfunctioninfo)

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import {getFunctions} from '@remotion/lambda';

const info = await getFunctions({
  region: 'eu-central-1',
  compatibleOnly: true
});

for (const fn of info) {
  console.log(fn.functionName) // "remotion-render-d8a03x"
  console.log(fn.memorySizeInMb) // 1536
  console.log(fn.timeoutInSeconds) // 120
  console.log(fn.version) // "2021-07-25"
}
```

## Argument

An object containing the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) that you would like to query.

### `compatibleOnly`

If true, only functions compatible with the currently installed Remotion Lambda version are returned.

## Return value

A promise resolving to an **array of objects** with the following properties:

### `functionName`

The name of the function.

### `memorySizeInMb`

The amount of memory allocated to the function.

### `functionName`

The name of the function.

### `version`

The version of the function. Remotion is [versioning](/docs/lambda/changelog) the Lambda function and a render can only be triggered from a version of `@remotion/lambda` that is matching the one of the function.

### `timeoutInSeconds`

The timeout that has been assigned to the Lambda function.

## See also

- [`getFunctionInfo()`](/docs/lambda/getfunctioninfo)
- [`deployFunction()`](/docs/lambda/deployfunction)
- [`deleteFunction()`](/docs/lambda/deletefunction)
