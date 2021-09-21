import { DEFAULT_MEMORY_SIZE } from "@remotion/lambda/dist/defaults";
import React from "react";

export const DefaultMemorySize: React.FC = () => {
  return <span>{DEFAULT_MEMORY_SIZE}</span>;
};
