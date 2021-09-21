---
sidebar_label: FAQ
title: Lambda - FAQ
slug: /lambda/faq
---

Some commonly asked questions about Remotion Lambda.

### Do I need to deploy a function for each render?

No, you only need to deploy one function and it will be capable of rendering multiple videos, even across different projects.

### Do I need to create multiple buckets?

Only one bucket per region is required.

### Do I need to deploy multiple sites?

You can render one project and use it for as many renders as you need. If you have multiple projects, you can deploy all of them and reuse the same Lambda function.

### What if I want to render longer videos?

You don't need to worry about the timeout of a Lambda function because Remotion splits the video in many parts and renders them in parallel. However, you need to be aware of the 512MB storage limit that may not be exceeded. See: [Storage space](/docs/lambda/runtime#storage-space)

### Why are you not using Amazon EFS?

We have evaluated Amazon Elastic File System (EFS) and we found the speed benefits of EFS are not substantial enough to warrant the increased complexity - for EFS to be integrated, VPC and security groups need to be created which will disable public internet access. To restore public internet access, a persistent EC2 instance needs to be created for proxying the traffic, negating many benefits of Lambda.

### How much does Remotion Lambda cost?

There are two cost components: The Remotion licensing fee (see [pricing](https://companies.remotion.dev), only applies if you are a company) and the AWS costs. AWS cost is dependant on the amount of memory that you assign to your lambda function. We estimate the Lambda costs for you and report it in the API response.

### How can I upgrade/redeploy a Lambda function?

Remotion will look for a version of the lambda function that matches the Node.JS library / CLI.

If you don't rely on the old function anymore, you can first delete all existing functions:

```bash
npx remotion lambda functions rm $(npx remotion lambda functions ls -q) -y
```

You can deploy a new function using:

```bash
npx remotion lambda functions deploy
```

If you are using the Node.JS APIs, the following APIs are useful: [`getFunctions()`](/docs/lambda/getfunctions), [`deployFunction()`](/docs/lambda/deployfunction) and [`deleteFunction()`](/docs/lambda/deletefunction).
