---
sidebar_label: Permissions
title: Lambda - Permissions
slug: /lambda/permissions
---

import {LambdaRegionList} from '../components/lambda/user-permissions.tsx';
import {RolePolicy} from '../components/lambda/role-permissions.tsx';

This document describes the necessary permissions for Remotion Lambda and explains to those interested why the permissions are necessary.

Before configuring permissions, [follow the setup guide first](/docs/lambda/setup).

## User permissions

This policy should be assigned to the **AWS user**. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [IAM](https://console.aws.amazon.com/iam/home) ➞ [Users](https://console.aws.amazon.com/iamv2/home#/users) ➞ Your created Remotion user ➞ Permissions tab ➞ Add inline policy ➞ JSON.

<LambdaRegionList />

## Role permissions

This policy should be assigned to the **role `remotion-lambda-role`** in your AWS account. The permissions below are given to the Lambda function itself.

To assign, go to [AWS console](https://console.aws.amazon.com/console/home) ➞ [IAM](https://console.aws.amazon.com/iam/home) ➞ [Roles](https://console.aws.amazon.com/iamv2/home#/roles) ➞ [`remotion-lambda-role`](https://console.aws.amazon.com/iam/home#/roles/remotion-lambda-role) ➞ Permissions tab ➞ [Add inline policy](https://console.aws.amazon.com/iam/home#/roles/remotion-lambda-role$createPolicy?step=edit).

<RolePolicy />

## Explanation

:::info
Currently the permissions are too loose. They will be made stricter to only require as minimal access as possible.
:::

<table>
  <tr>
    <th>
      Permission
    </th>
    <th>
      Scope
    </th>
    <th>
      Reason
    </th>
  </tr>
  <tr>
    <td>
      <code>iam:GetUser</code>
    </td>
    <td>
      <code>{"arn:aws:iam::*:user/${aws:username}"}</code>
    </td>
    <td>
    Get the authenticated user in order to do a permission validation.
    </td>
  </tr>
  <tr>
    <td>
      <code>iam:SimulatePrincipalPolicy</code>
    </td>
    <td><code>*</code></td>
    <td>
      Allows for verification that all the policies are properly set.
    </td>
  </tr>
  <tr>
    <td>
      <code>s3:GetObject</code> <br />
      <code>s3:DeleteObject</code> <br />
      <code>s3:DeleteBucket</code> <br />
      <code>s3:PutBucketWebsite</code> <br />
      <code>s3:ListBucket</code> <br />
      <code>s3:DeleteBucketWebsite</code>
    </td>
    <td>
      <code>{'arn:aws:s3:::remotion-*'}</code>
    </td>
    <td>
      Allows for executing basic CRUD operations on all S3 buckets in your account that start with <code>remotion-</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>s3:ListAllMyBuckets</code>
    </td>
    <td>
      <code>{'arn:aws:s3:::*'}</code>
    </td>
    <td>
      Allows listing the names of all buckets in your account, in order to detect an already existing Remotion bucket.
    </td>
  </tr>
  <tr>
    <td>
      <code>lambda:CreateFunction</code> <br/>
      <code>lambda:InvokeFunction</code> <br/>
      <code>lambda:DeleteFunction</code> <br/>
      <code>lambda:PublishLayerVersion</code> <br/>
      <code>lambda:DeleteLayerVersion</code> <br/>
      <code>lambda:GetLayerVersion</code>
    </td>
    <td>
      <code>{'arn:aws:lambda:*::remotion-*'}</code>
    </td>
    <td>
      Allows for creating, deleting and deleting Lambda functions starting with <code>remotion-</code>. Allows for managing layers (responsible for delivering FFMPEG and Puppeteer binaries).
    </td>
  </tr>
  <tr>
    <td>
      <code>lambda:ListLayers</code> <br />
      <code>lambda:ListFunctions</code>
    </td>
    <td>
      <code>{'*'}</code>
    </td>
    <td>
      Allows for reading the metadata of all Lambdas and Lambda Layers in your account for finding Remotion-related resources.
    </td>
  </tr>
</table>
