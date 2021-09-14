import React from "react";

const outer: React.CSSProperties = {
  width: 110,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
};

const icon: React.CSSProperties = {
  display: "flex",
  width: 50,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
  margin: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  cursor: "pointer",
};

export const TemplateIcon: React.FC<{ label: string }> = ({
  children,
  label,
}) => {
  return (
    <div style={outer}>
      <div style={icon}>{children}</div>
      <div style={labelStyle}>{label}</div>
    </div>
  );
};
