import {
  createSmoothSvgPath,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioDataIfPossible } from "../helpers/use-windowed-audio-data-if-possible";

export const VoiceVis: React.FC<{
  audioSrc: string;
  padding: number;
  numberOfSamples: number;
  windowInSeconds: number;
  posterization: number;
  amplitude: number;
}> = ({
  padding,
  numberOfSamples,
  windowInSeconds,
  posterization,
  amplitude,
  audioSrc,
}) => {
  const { width, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const height = 120;

  const posterized = Math.round(frame / posterization) * posterization;

  const { audioData, dataOffsetInSeconds } = useWindowedAudioDataIfPossible({
    fps,
    frame,
    src: audioSrc,
    windowInSeconds: 10,
  });

  if (!audioData) {
    return null;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame: posterized,
    audioData: audioData,
    numberOfSamples,
    windowInSeconds: windowInSeconds,
    channel: 0,
    dataOffsetInSeconds: dataOffsetInSeconds,
  });

  const p = createSmoothSvgPath({
    points: waveform.map((y, i) => {
      return {
        x: (i / (waveform.length - 1)) * width,
        y: height / 2 + ((y * height) / 2) * amplitude,
      };
    }),
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        overflow: "visible",
        height,
        marginTop: 40,
        marginBottom: 40,
      }}
      width={width - padding * 2}
      height={height}
    >
      <path
        strokeLinecap="round"
        fill="none"
        stroke="#D2FF00"
        strokeWidth={10}
        d={p}
      />
    </svg>
  );
};
