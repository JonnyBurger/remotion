---
id: getuserpolicy
title: getUserPolicy()
slug: /lambda/getuserpolicy
---

Returns an inline JSON policy to be assigned to the AWS user whose credentials are being used for excuting CLI commands or calling Node.JS functions.

See [Setup tutorial](/docs/lambda/setup) for setting up Lambda from scratch or [User permissions](/docs/lambda/permissions#user-permissions) to see a copy of the current policy file with explanations.

## Example

```ts twoslash
import {getUserPolicy} from '@remotion/lambda';

console.log(
  getUserPolicy()
); /* `
{
  "Version": "2012-10-17",
  "Statements": [
    // ...
  ]
}
` */
```

## See also

- [getRolePolicy()](/docs/lambda/getrolepolicy)
- [Permissions](/docs/lambda/permissions)
