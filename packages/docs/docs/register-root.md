---
id: register-root
title: registerRoot()
---

`registerRoot` is a function that registers the root component of the Remotion project. In the root component, one or multiple compositions should be returned (in the case of multiple compositions, they should be wrapped in a React Fragment).

:::info
`registerRoot()` should live in a file that is separarate from the list of compositions. This is because when using React Fast Refresh, all the code in the file that gets refreshed gets executed again, however, this function should only be called once.
:::

## Example

```tsx twoslash title="src/index.ts"
// @filename: ./Video.tsx
export const RemotionVideo = () => <></>;

// @filename: index.tsx
// ---cut---
import { registerRoot } from "remotion";
import { RemotionVideo } from "./Video";

registerRoot(RemotionVideo);
```

```tsx twoslash title="src/Video.tsx"
// @allowUmdGlobalAccess
// @filename: MyComponent.tsx
export default () => <></>;

// @filename: MyOtherComponent.tsx
export default () => <></>;

// @filename: index.tsx
const Composition: React.FC<{
  id: string;
  fps: number;
  height: number;
  width: number;
  component: () => JSX.Element;
}> = () => <></>;
// ---cut---
import MyComponent from "./MyComponent";
import MyOtherComponent from "./MyOtherComponent";

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="comp"
        fps={30}
        height={1080}
        width={1920}
        component={MyComponent}
      />
      <Composition
        id="anothercomp"
        fps={30}
        height={1080}
        width={1920}
        component={MyOtherComponent}
      />
    </>
  );
};
```

## Defer registerRoot()

In some cases, such as dynamically importing roots or loading WebAssembly, you might want to defer the loading of registerRoot(). If you are doing that, you need to tell Remotion to wait by using the [`delayRender()` / `continueRender()`](/docs/delay-render) pattern.

```tsx twoslash
// @filename: ./Video.tsx
export const RemotionVideo = () => <></>;

// @filename: index.tsx
const loadWebAssembly = () => Promise.resolve();
// ---cut---

import { delayRender, continueRender, registerRoot } from "remotion";
import { RemotionVideo } from "./Video";

const wait = delayRender();

loadWebAssembly().then(() => {
  registerRoot(RemotionVideo);
  continueRender(wait);
});
```

## See also

- [`<Composition />` component](/docs/composition)
- [The fundamentals](/docs/the-fundamentals)
