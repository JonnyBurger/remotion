---
id: reusability
title: Reuse components using Sequences
sidebar_label: Reuse components
---

Let's say we want to show two titles that both fade in after each other.

In order to make a title reusable, we first factor it out into it's own component.

```tsx
import {useCurrentFrame, interpolate} from 'remotion';

const Title: React.FC<{title: string;}> = ({title}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

    return (
      <div style={{opacity}}>{title}</div>
    )
}

export const MyVideo = () => {
  return (
    <div style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Title title="Hello World"/>
    </div>
  )
}
```

Now we can use the `<Sequence>` component to limit the duration of the first title and time-shift the appearance of the second title.

```tsx
import {useCurrentFrame, interpolate, Sequence} from 'remotion';

const Title: React.FC<{title: string;}> = ({title}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

    return (
      <div style={{opacity}} >{title}</div>
    )
}

export const MyVideo = () => {
  return (
    <div style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Sequence from={0} durationInFrames={40}>
        <Title title="Hello"/>
      </Sequence>
      <Sequence from={40} durationInFrames={Infinity}>
        <Title title="World"/>
      </Sequence>
    </div>
  )
}
```

You should see two titles appearing after each other. Titles which are not shown during a frame are unmounted.
This is why the layout did not shift (as it does in HTML) when you added a second title. If you want the titles to overlap in time, use absolute positioning if necessary.

## See also

- [`<Sequence>` component](sequence)
