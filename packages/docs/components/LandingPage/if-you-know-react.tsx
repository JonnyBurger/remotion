import React from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import { CodeExample } from "./CodeExample";
import styles from "./ifyouknowreact.module.css";

export const IfYouKnowReact: React.FC = () => {
  return (
    <div className={styles.ifyouknowrow}>
      <CodeExample />
      <div style={{ width: 40 }} />
      <div>
        <h2 className={styles.ifyouknowtitle}>
          If you know <span className={styles.rea}>React</span> <br />
          you can make videos.
        </h2>
        <p>
          Remotion gives you the tools for video creation, <br /> but the rules
          of React stay the same. <br />
        </p>
        Learn the fundamentals in just a few minutes.
        <Spacer />
        <Spacer />
        <a className={styles.aknow} href="/docs/the-fundamentals">
          <BlueButton size="sm" fullWidth={false} loading={false}>
            Learn Remotion
          </BlueButton>
        </a>
      </div>
    </div>
  );
};
