---
id: parametrized-rendering
title: Parametrized rendering
---

Parametrized rendering is the idea of creating a video template once and then render as many videos as you want with different parameters. Just like in regular React, we use props to reuse and customize components!

## Defining accepted props

To define which props your video accepts, simply give your component the `React.FC` type and pass in a generic argument describing the shape of the props you want to accept.

```tsx {2-3}
export const MyComponent: React.FC<{
  propOne: string;
  propTwo: number;
}> = ({propOne, propTwo}) => {
  return (
    <div>props: {propOne}, {propTwo}</div>
  );
}
```

## Define default props

When registering the component as a sequence, you can define the default props:

```tsx {13-16}
import {Sequence} from 'remotion';
import {MyComponent} from './MyComponent';

export const Root = () => {
  return (
    <>
      <Sequence
        id="my-video"
        width={1080}
        height={1080}
        fps={30}
        component={MyComponent}
        defaultProps={{
          propOne: 'Hi',
          propTwo: 10
        }}
      />
    </>
  )
}
```

By using `React.FC`, you can ensure type safety and avoid errors caused by typos.

## Input props

Input props are props that are passed in externally while rendering that can replace or override the default props

### Passing input props in the CLI

When rendering (for example using the `npm run build` script defined in `package.json`), you can override some or all default props by passing a CLI flag. It must be either valid JSON or a path to a file that contains valid JSON. Using this technique, type safety cannot be guaranteed.

**Using inline JSON**

```bash
npx remotion render src/index.tsx HelloWorld helloworld.mp4 --props='{"propOne": "Hi", "propTwo": 10}'
```

**Using a file path:**

```bash
npx remotion render src/index.tsx HelloWorld helloworld.mp4 --props=./path/to/props.json
```

[See also: CLI flags](/docs/cli)

### Passing input props when server rendering

When server-rendering using `renderFrames`, you can pass props using the `inputProps` option:

```tsx {8-10}
await renderFrames({
  config: video,
  webpackBundle: bundled,
  onStart: () => undefined,
  onFrameUpdate: (f) => undefined,
  parallelism: null,
  outputDir: framesDir,
  inputProps: {
    titleText: 'Hello World'
  },
  compositionId: 'HelloWorld',
  imageFormat: 'jpeg'
});
```

### Passing input props in GitHub Actions

[See: Render using GitHub Actions](/docs/ssr#render-using-github-actions)

When using GitHub Actions, you need to adjust the file at `.github/workflows/render-video.yml` to make the inputs in the `workflow_dispatch` section manually match the shape of the props your root component accepts.

```yml {3,7}
workflow_dispatch:
  inputs:
    titleText:
      description: "Which text should it say?"
      required: true
      default: "Welcome to Remotion"
    titleColor:
      description: "Which color should it be in?"
      required: true
      default: "black"
```

### Retrieve input props

Input props are passed to the component of your composition directly and you can access as regular React component props.

_Available since v2.0._: You can also use the `getInputProps()` function to retrieve props that you have given as an input. This is useful if you need to retrieve the props in a position where you are not inside your component, such as when determining the video duration, dimensions or frame rate.

## You can still use components as normal

Even if you have registered a component as a sequence,
you can still use it as normal in your videos and pass it's props directly. Default props don't apply in this case.

```tsx
<MyComponent propOne="hi" propTwo={10} />
```
