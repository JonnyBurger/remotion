import React from "react";
import { Blank } from "./icons/blank";
import { Cubes } from "./icons/cubes";
import { JSIcon } from "./icons/js";
import { Next } from "./icons/next";
import { TypeScriptIcon } from "./icons/ts";
import { TTSIcon } from "./icons/tts";
import { Waveform } from "./icons/waveform";
import { TemplateIcon } from "./template-icon";

const clone: React.CSSProperties = {
  fontSize: 13,
  textAlign: "center",
  borderBottom: "1px solid white",
  marginBottom: 10,
};

export const ChooseTemplate: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TemplateIcon label={"Blank Project"}>
          <Blank style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Hello World"}>
          <TypeScriptIcon style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Plain Javascript"}>
          <JSIcon style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Audio Visualizer"}>
          <Waveform style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"3D Video"}>
          <Cubes style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Text to Speech"}>
          <TTSIcon style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Next.JS project"}>
          <Next style={{ width: 60 }} />
        </TemplateIcon>
      </div>
    </div>
  );
};
