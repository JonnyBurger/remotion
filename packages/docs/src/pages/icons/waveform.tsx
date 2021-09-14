import React, { SVGProps } from "react";

export const Waveform: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="waveform"
      className="svg-inline--fa fa-waveform fa-w-20"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M140 192h-24a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16v-96a16 16 0 0 0-16-16zm-96 32H20a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM236 96h-24a16 16 0 0 0-16 16v288a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16V112a16 16 0 0 0-16-16zm384 128h-24a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM524 64h-24a16 16 0 0 0-16 16v352a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm-96 64h-24a16 16 0 0 0-16 16v224a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16V144a16 16 0 0 0-16-16zM332 0h-24a16 16 0 0 0-16 16v480a16 16 0 0 0 16 16h24a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16z"
      />
    </svg>
  );
};
