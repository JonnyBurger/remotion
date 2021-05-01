---
title: Using audio
id: using-audio
---

## Import audio

You can import an audio file using an `import` statement:

```tsx
import audio from './audio.mp3'
```

You may add an [`<Audio/>`](/docs/audio) tag to your composition to add sound to it.

```tsx {8}
import {Audio} from 'remotion';
import audio from './audio.mp3'

export const MyComposition: React.FC = () => {
  return (
    <div>
      <h1>Hello World!</h1>
      <Audio src={audio} />
    </div>
  )
}
```

The audio will play from the start, at full volume and as long as the duration of the composition or the duration of the audio is long, whatever is shorter.

You can also import remote audio by passing a URL (`src="https://example.com/audio.mp3"`).

You can mix multiple tracks together by adding more audio tags.

## Cutting or trimming the audio

You can use the [`<Sequence />`](/docs/sequence) API to cut and trim audio.
As a convienience, the `<Audio />` tag supports the `startFrom` and `endAt` props.

```tsx {10-11}
import {Audio} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio
        src={audio}
        startFrom={59} // if your composition is 30fps, then it will start at 2s
        endAt={120} // if your composition is 30fps, then it will end at 4s
      />
    </div>
  )
}
```

## Delaying audio

Use a `<Sequence>` with a positive `from` attribute to delay the audio from playing.
In the following example, the audio will start playing (from the beginning) after 100 frames.

```tsx {8}
import {Audio, Sequence} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Sequence from={100} durationInFrames={Infinity}>
        <Audio src={audio}>
      </Sequence>
    </div>
  )
}
```

## Controlling volume

You can use the `volume` prop to control the volume.
**The simplest way is to pass a number between 0 and 1**. `1` is the maximum volume, values over 1 are allowed but will not increase the volume further. Volumes under 0 are not allowed.

```tsx {8}
import {Audio} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio src={audio} volume={0.5}>
    </div>
  )
}
```

You can also **change volume over time**, in this example we are using the [interpolate()](/docs/interpolate) function. Note that because values below 0 are not allowed, we need to set the `extrapolateLeft: 'clamp'` option to ensure no negative values.

```tsx {10}
import {Audio, interpolate, useCurrentFrame} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  const frame = useCurrentFrame();

  return (
    <div>
      <div>Hello World!</div>
      <Audio src={audio} volume={interpolate(frame, [0, 30], [0,1], {extrapolateLeft: 'clamp'})}>
    </div>
  )
}
```

You may also pass a **callback function** that returns the volume based an arbitrary frame number. This has the benefit that Remotion is able to **draw a volume curve in the timeline**!

```tsx {8}
import {Audio, interpolate} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  return (
    <div>
      <div>Hello World!</div>
      <Audio src={audio} volume={f => interpolate(f, [0, 30], [0,1], {extrapolateLeft: 'clamp'})}>
    </div>
  )
}
```

Note that if you pass in a callback function, the first frame on which audio is being played is always the frame `0`.

## `muted` property

You may pass in the `muted` and it may change over time. When `muted` is true, audio will be omitted at that time. In the following example, we are muting the track between frame 40 and 60.

```tsx {10}
import {Audio, interpolate, useCurrentFrame} from 'remotion';
import audio from './audio.mp3'

export const MyVideo = () => {
  const frame = useCurrentFrame();

  return (
    <div>
      <div>Hello World!</div>
      <Audio src={audio} muted={frame >= 40 && frame <= 60}>
    </div>
  )
}
```

## Use audio from `<Video />` tags

Audio from [`<Video />`](/docs/video) tags are also included in the output. You may also use the `volume` and `muted` props in the same way.

## Audio visualization

You can obtain audio data and create visualizations based on it. See the page [Audio visualization](/docs/audio-visualization) for more info.

## See also

- [Importing assets](/docs/assets)
- [Audio visualization](/docs/audio-visualization)
- [`<Audio />`](/docs/audio) tag
