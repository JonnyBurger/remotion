---
id: deletefunction
title: deleteFunction()
slug: /lambda/deletefunction
---

Deletes a deployed Lambda function based on it's name.

To retrieve a list of functions, call [`getFunctions()`](/docs/lambda/getfunctions) first.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import {deleteFunction, getFunctions} from '@remotion/lambda';

const functions = await getFunctions({
  region: 'us-east-1',
  compatibleOnly: false
});
for (const fn of functions) {
  await deleteFunction({
    region: 'us-east-1',
    functionName: fn.functionName
  });
}
```

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) to which the function was deployed to.

### `functionName`

The name of the function to be deleted.

## Return value

Nothing. If the deletion failed, the function rejects with an error.

## See also

- [deployFunction()](/docs/lambda/deployfunction)
- [getFunctions()](/docs/lambda/getfunctions)
