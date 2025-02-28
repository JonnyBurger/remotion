import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useCurrentScale,
} from "remotion";
import { Word } from "./Word";
import { Caption } from "@remotion/captions";
import { msToFrame } from "../helpers/ms-to-frame";

const useWindowedFrameCaptions = ({
  captions,
  windowStart,
  windowEnd,
}: {
  captions: Caption[];
  windowStart: number;
  windowEnd: number;
}) => {
  return useMemo(() => {
    return captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) >= windowStart && msToFrame(endMs) <= windowEnd;
    });
  }, [captions, windowEnd, windowStart]);
};

export const PaginatedCaptions: React.FC<{
  readonly captions: Caption[];
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly subtitlesZoomMeasurerSize: number;
  readonly subtitlesLineHeight: number;
  readonly onlyDisplayCurrentSentence: boolean;
}> = ({
  startFrame,
  endFrame,
  captions,
  linesPerPage,
  subtitlesTextColor: transcriptionColor,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender());
  const windowedFrameSubs = useWindowedFrameCaptions({
    captions,
    windowStart: startFrame,
    windowEnd: endFrame,
  });
  const currentScale = useCurrentScale();

  const [lineOffset, setLineOffset] = useState(0);

  const currentAndFollowingSentences = useMemo(() => {
    // If we don't want to only display the current sentence, return all the words
    if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

    const indexOfCurrentSentence =
      windowedFrameSubs.findLastIndex((w, i) => {
        const nextWord = windowedFrameSubs[i + 1];

        return (
          nextWord &&
          (w.text.endsWith("?") ||
            w.text.endsWith(".") ||
            w.text.endsWith("!")) &&
          msToFrame(nextWord.startMs) < frame
        );
      }) + 1;

    return windowedFrameSubs.slice(indexOfCurrentSentence);
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

  useEffect(() => {
    const linesRendered =
      (windowRef.current?.getBoundingClientRect().height as number) /
      (subtitlesLineHeight * currentScale);
    const linesToOffset = Math.max(0, linesRendered - linesPerPage);
    setLineOffset(linesToOffset);
    continueRender(handle);
  }, [
    currentScale,
    frame,
    handle,
    linesPerPage,
    subtitlesLineHeight,
    subtitlesZoomMeasurerSize,
  ]);

  const currentFrameSentences = currentAndFollowingSentences.filter((word) => {
    return msToFrame(word.startMs) < frame;
  });
  console.log(currentFrameSentences);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div
        ref={windowRef}
        style={{
          transform: `translateY(-${lineOffset * subtitlesLineHeight}px)`,
        }}
      >
        {currentFrameSentences.map((item) => (
          <span
            key={item.startMs + item.endMs}
            id={String(item.startMs + item.endMs)}
          >
            <Word
              frame={frame}
              item={item}
              transcriptionColor={transcriptionColor}
            />
          </span>
        ))}
      </div>
    </div>
  );
};
