---
id: dynamic-metadata
title: Dynamic duration, FPS & dimensions
---

## Change metadata based on input props

_Available since v2.0._

Using [Input props](parametrized-rendering) you can customize the content of your videos while rendering. But what about if you want to change the duration, frame rate or the dimensions of your video based on input props or asynchronous operations?

Use the `getInputProps()` method to retrieve the props that you have passed as an input.
For example if you have passed `--props='{"hello": "world"}'` as a command line flag, you can read the value in your Remotion project like this:

```tsx
const {hello} = getInputProps()
console.log(hello) // "world"
```

You can use this technique to dynamically change the frame rate, dimensions or duration of our video as you render. For example, if you pass `--props={"duration": 100}` during rendering, the video will be 100 frames long if you define your composition as followed:

```tsx

import {getInputProps, Composition} from 'remotion';

const inputProps = getInputProps()

export const Index = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComponent}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={inputProps?.duration ?? 20}
      >
    </>
  )
}
```

:::tip
In the example above, we specified fallback duration for use while you are previewing the video, but you can also pass `--props` during preview!
:::

## Change metadata based on asynchronous information

_Available since v1.5._

Sometimes you need to calculate metadata programmatically in a non-synchronous manner. For example, you have a source video and you want your video to be just as long as the source video. You can use the [`delayRender()`/`continueRender()`](/docs/data-fetching) pattern for this as well!

In this example, we fetch the duration of "Big Buck Bunny" and use it to make our video just that long:

```tsx
export const Index: React.FC = () => {
  const [handle] = useState(() => delayRender());
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const video = document.createElement('video');
    video.src =
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    video.onloadedmetadata = () => {
      setDuration(Math.round(video.duration * 30));
      continueRender(handle);
    };
  }, [handle]);

  return (
    <>
      <Composition
        id="dynamic-duration"
        component={VideoTesting}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={duration}
      />
    </>
  )
}
```

## Change metadata in server-side rendering

Both `getCompositions()` and `renderFrames()` functions accept an `inputProps` object as a parameter.

```tsx
getCompositions(bundled, {
  inputProps: {
    custom: 'data'
  }
})
```

```tsx
renderFrames({
  // ...
  inputProps: {
    custom: 'data'
  }
})
```

Make sure to pass the parameter to both of these functions, so the input props are available to `getInputProps` during the composition fetching and rendering stage.

## See also

- [`getInputProps()`](get-input-props)
