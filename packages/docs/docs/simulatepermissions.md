---
id: simulatepermissions
title: simulatePermissions()
slug: /lambda/simulatepermissions
---

Runs tests through the AWS Simulator ensuring that all the necessary permissions are set for the authenticated user.

Makes a lot of requests to AWS. Avoid calling the function many times in quick succession to hit a rate limit.

The CLI equivalent is `npx remotion lambda policies validate`.

The function does reject with an error if a permission is missing, rather the missing permission is indicated in the return value.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import {simulatePermissions} from '@remotion/lambda';

const {results} = await simulatePermissions({
  region: 'us-east-1',
});

for (const result of results) {
  console.log(result.decision) // "allowed"
  console.log(result.name) // "iam:GetUser"
}
```

## Arguments

An object with the following properties:

### `region`

The [AWS region](/docs/lambda/region-selection) that you would like to query.

### `onSimulation`

_optional_

A callback function that gets called every time a new simulation has been executed. This allows you to react to new simulation results coming in much faster than waiting for the return value of the function. Example:

```ts twoslash
// @module: esnext
// @target: es2017

import {simulatePermissions} from '@remotion/lambda';

const {results} = await simulatePermissions({
  region: 'us-east-1',
  onSimulation: (result) => {
    console.log(result.decision) // "allowed"
    console.log(result.name) // "iam:GetUser"
  }
});
```

## Return value

**An array of objects** containing simulation results of each necessary permission. The objects contain the following keys:

### `decision`

Either `"allowed"`, `"implicitDeny"` or `"explicitDeny"`.

### `name`

The identifier of the required permission. See the [Permissions page](/docs/lambda/permissions) to see a list of required permissions.

## See also

- [getUserPolicy()](/docs/lambda/getuserpolicy)
- [getRolePolicy()](/docs/lambda/getrolepolicy)
- [Permissions](/docs/lambda/permissions)
