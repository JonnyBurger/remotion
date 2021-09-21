import { getRolePolicy } from "@remotion/lambda/dist/api/iam-validation/suggested-policy";
import React from "react";

export const RolePolicy: React.FC = () => {
  return (
    <div>
      <pre>{getRolePolicy()}</pre>
    </div>
  );
};
