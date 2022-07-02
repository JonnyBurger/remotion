---
title: npx remotion still
sidebar_label: still
---

import {AngleChangelog} from '../../components/AngleChangelog';

_Available from v2.3._

Render a still frame based on the entry point, the composition ID and save it to the output location.

```bash
npx remotion still <entry-file> <composition-id> <output-location>
```

## Flags

### `--props`

[React Props to pass to the selected composition of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`). Can also be read using [`getInputProps()`](/docs/get-input-props).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--image-format`

[`jpeg` or `png` - JPEG is faster, but doesn't support transparency.](/docs/config#setimageformat) The default is `jpeg`.

### `--config`

Specify a location for the Remotion config file.

### `--env-file`

Specify a location for a dotenv file. Default `.env`.

### `--quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setquality). Doesn't work when image format is `png`.

### `--overwrite`

[Write to output even if file already exists.](/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--browser-executable`

[Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering.

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frame`

Which frame should be rendered. Example `--frame=10`. Default `0`.

### `--bundle-cache`

[Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

### `--port`

[Set a custom HTTP server port to serve the Webpack bundle](/docs/config#setPort). If not defined, Remotion will try to find a free port.

### `--ffmpeg-executable`

[Set a custom `ffmpeg` executable](/docs/config#setFfmpegExecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### `--ffprobe-executable`

[Set a custom `ffprobe` executable](/docs/config#setFfprobeExecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

### `--timeout`

Define how long a single frame may take to resolve all [`delayRender()`](/docs/delay-render) calls before it times out in milliseconds. Default: `30000`.

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored. Available since v2.6.5.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.
Available since v2.6.5.

### `--disable-headless`

Opens an actual browser during rendering to observe the render.
Available since v2.6.5.

### `--gl`

<AngleChangelog />

Select the OpenGL renderer backend for Chromium.
Accepted values:

- `"angle"`,
- `"egl"`,
- `"swiftshader"`
- `"swangle"`
- `null` - Chromiums default

**Default for local rendering**: `null`.  
**Default for Lambda rendering**: `"swangle"`.
