---
id: getorcreatebucket
title: getOrCreateBucket()
slug: /lambda/getorcreatebucket
---

Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.

**Only 1 bucket per region** is necessary for Remotion Lambda to function.

```ts twoslash
// @module: ESNext
// @target: ESNext
import {getOrCreateBucket} from '@remotion/lambda';

const {bucketName} = await getOrCreateBucket({region: 'us-east-1'})

console.log(bucketName) // "remtionlambda-32df3p"
```

## Arguments

An object with the following property:

### `region`

The [AWS region](/docs/lambda/region-selection) which you want to create a bucket in.

## Return value

A promise resolving to an object with the following property:

### `bucketName`

The name of your bucket that was found or created.

## See also

- [getFunctions()](/docs/lambda/getfunctions)
