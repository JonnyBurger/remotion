---
id: getrolepolicy
title: getRolePolicy()
slug: /lambda/getrolepolicy
---

Returns an inline JSON policy to be assigned to the 'remotion-lambda-role' role that needs to be created in your AWS account.

These permissions will be given to the Lambda function itself.

See [Setup tutorial](/docs/lambda/setup) for setting up Lambda from scratch or [Role permissions](/docs/lambda/permissions#role-permissions) to see a copy of the current policy file with explanations.

## Example

```ts twoslash
import {getRolePolicy} from '@remotion/lambda';

console.log(
  getRolePolicy()
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

- [getUserPolicy()](/docs/lambda/getuserpolicy)
- [Permissions](/docs/lambda/permissions)
