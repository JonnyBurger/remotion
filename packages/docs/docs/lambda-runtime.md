---
id: lambda-runtime
title: Runtime
slug: /lambda/runtime
---

import {DefaultMemorySize} from '../components/lambda/default-memory-size';
import {DefaultTimeout} from '../components/lambda/default-timeout';

This page describes the environment that the Lambda function is running in.

## Node.JS Version

The lambda function will use a NodeJS version from the `14.x` release line.

## Memory size

The default is <DefaultMemorySize/> MB. You can configure it by passing an argument to [`deployFunction()`](/docs/lambda/deployfunction) or by passing a `--memory` flag to the CLI when deploying a function.

## Timeout

The default is <DefaultTimeout /> seconds. You can configure it when calling [`deployFunction()`](/docs/lambda/deployfunction) or by passing a `--timeout` flag to the CLI when deploying a function.

Note that you probably don't need to increase it - Since the video is rendered by splitting it into many parts and those parts are rendered in parallel, there are rare cases where you need more than <DefaultTimeout /> seconds.

## Storage space

The function only has 512MB of storage space in total, of which ~200MB are already taken by Google Chrome, FFMPEG and the Remotion function code. This means your video rendering must not take more than ~300MB of space - keep in mind that the concatenations of various chunks into one video takes place within a Lambda function, so the space must suffice for both the chunks and the output video.

In practice, this means your final video should not be bigger than ~150MB.

## Google Chrome

The function already includes a running version of Google Chrome.
The browser was compiled including the proprietary codecs, so you can include MP4 videos into your project.

_TODO: Specify which version of Google Chrome_

## FFMPEG

The function already includes an FFMPEG binary.

_TODO: Specify which version of FFMPEG._

## Fonts

The function includes the following fonts:

- Noto Color Emoji
- Noto Sans Black
- Noto Sans Bold
- Noto Sans Regular
- Noto Sans SemiBold
- Noto Sans Thin
- Noto Sans Arabic Regular
- Noto Sans Devanagari Regular
- Noto Sans Hebrew Regular
- Noto Sans Tamil Regular
- Noto Sans Thai Regular

If you'd like to use different fonts, we recommend using Webfonts.

While the set of default fonts that we can include must be kept small in order to save space, we are happy to hear feedback if you encounter a scenario where characters cannot be rendered.
