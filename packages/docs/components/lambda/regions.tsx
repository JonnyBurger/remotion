import { AWS_REGIONS } from "@remotion/lambda/dist/regions";
import React from "react";

export const LambdaRegionList: React.FC = () => {
  return (
    <div>
      {AWS_REGIONS.map((region) => {
        return (
          <span key={region}>
            <code>{region}</code>{" "}
          </span>
        );
      })}
    </div>
  );
};
