import splitbee from "@splitbee/web";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import React from "react";
import { LightningFastEditor } from "../../components/LandingPage/editor";
import { FreePricing } from "../../components/LandingPage/FreePricing";
import { IfYouKnowReact } from "../../components/LandingPage/if-you-know-react";
import { Parametrize } from "../../components/LandingPage/parametrize";
import { RealMP4Videos } from "../../components/LandingPage/real-mp4-videos";
import { SuccessFeatures } from "../../components/LandingPage/SuccessFeatures";
import { WriteInReact } from "../../components/LandingPage/WriteInReact";
import { ChooseTemplate } from "../components/ChooseTemplate";
import styles from "./landing.module.css";
import { VideoApps } from "../../components/LambdaSplash/VideoApps";
import { VideoAppsTitle } from "../../components/LambdaSplash/VideoAppsTitle";

setTimeout(() => {
  splitbee.init();
}, 100);

const clone: React.CSSProperties = {
  fontSize: 13,
  textAlign: "center",
  paddingBottom: 10,
  paddingTop: 10,
  color: "var(--light-text-color)",
};

const NewLanding: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Remotion | Write videos in React</title>
        <meta
          name="description"
          content="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more
        technologies to render videos programmatically!"
        />
      </Head>
      <br />
      <br />
      <br />
      <br />

      <div className={styles.content}>
        <WriteInReact />
        <br />
        <br />
        <div
          style={{
            paddingBottom: 20,
          }}
        >
          <div style={clone}>Get started using a template:</div>

          <div className={styles.content}>
            <ChooseTemplate />
          </div>
        </div>
        <br />
        <br />
        <br />
        <IfYouKnowReact />
        <br />
        <br />
        <br />
        <br />
        <br />
        <RealMP4Videos />
        <br />
        <br />
        <br />
        <br />
        <LightningFastEditor />
        <br />
        <br />
        <br />
        <br />
        <Parametrize />
        <br />
        <br />
        <VideoAppsTitle />
        <VideoApps active="remotion" />
        <br />
        <br />
        <FreePricing />
        <SuccessFeatures />
        <br />
        <br />
      </div>
    </Layout>
  );
};

export default NewLanding;
