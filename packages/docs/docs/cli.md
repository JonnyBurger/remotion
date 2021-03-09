---
title: CLI options
id: cli
---

The default command in package.json that powers `npm run build` is:

```bash
npx remotion render <entry-file> <composition-id> <output-location>
```

## Flags

Besides choosing a video and output location with the command line arguments, the following flags are supported:

- `--props`: React Props to pass to the root component of your video. Must be a serialized JSON string.
- `--concurrency`: [How many CPU threads to use.](/docs/config#setconcurrency) Minimum 1. The maximum is the amount of threads you have.
- `--pixel-format`: [Set a custom pixel format. See here for available values.](/docs/config#setpixelformat)
- `--image-format`: [`jpeg` or `png` - JPEG is faster, but supports transparency.](/docs/config#setimageformat) The default image format is `jpeg` since v1.1. Flag available since v1.4.
- `--config`: Specify a location for the Remotion config file. Available in v1.2 and later.
- `--quality`: [Value between 0 and 100 for JPEG rendering quality](/docs/config#setquality). Doesn't work when PNG frames are rendered. Available since v1.4.
- `--overwrite`: [Write to output even if file already exists.](/docs/config#setoverwriteoutput)
- `--sequence`: [Pass this flag if you want an image sequence as the output instead of a video.](/docs/config#setimagesequence) Available since v1.4.
- `--codec`: [`h264` or `h265` or `png` or `vp8` or `vp9`](/docs/config#setoutputformat). If you don't supply `--codec`, it will use the H.264 encoder. Available since v1.4.
- `--crf`: [To set Constant Rate Factor (CRF) of the output](/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size. Available since v1.4.
- `--browser-executable`: [Path to a Chrome executable](/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering. Available since v1.5.
- `--frames`: [Render a still frame or a subset of a video](/docs/config#setframerange). Example: `--frames=0-9` (To select the first 10 frames) or `--frames=50` (To render a still of the 51st frame). Available since v2.0.
- `--bundle-cache`: [Enable or disable Webpack caching](/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching. Available since v2.0.

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](/docs/config).
:::

## Example command

```
npx remotion render --overwrite --codec=vp8 src/index.tsx HelloWorld video.mp4
```

## See also

- [Render your video](/docs/render)
- [Configuration file](/docs/config)
