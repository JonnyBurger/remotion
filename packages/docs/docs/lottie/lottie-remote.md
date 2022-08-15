---
id: lottie-remote
sidebar_label: "Loading from a URL"
title: "Loading Lottie animations from a URL"
slug: remote
---

In order to load a Lottie animation from a URL that has been put into the `public/` folder, use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and Remotion's [`delayRender()`](/docs/delay-render) function.

The resource must support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Use the `LottieAnimationData` type to keep a state using React's `useState()` and only render the [`<Lottie>`](/docs/lottie/lottie) component once the data has been fetched.

```tsx twoslash title="Animation.tsx"
import { continueRender, delayRender } from "remotion";
import { useEffect, useState } from "react";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

const Balloons = () => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));

  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch("https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json")
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        console.log("Animation failed to load", err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## See also

- [`<Lottie>`](/docs/lottie/lottie)
- [Loading from `staticFile()`](/docs/staticfile)
