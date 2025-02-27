import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { createChromaKeyShader, WebGLContext } from "./shader/ChromaKeyShader";
import { GreenScreenOverlayProps } from "./types/greenscreenprops";

export const ChromaKeyEffect: React.FC<GreenScreenOverlayProps> = ({
  src,
  startTimeInSeconds = 0,
  durationInSeconds,
  loop = true,
  isPlaying,
  scale = 1,
  position = { x: 0, y: 0 },
  isChromaKeyEnabled = false,
  chromaKeyConfig = {
    keyColor: [0.0, 1.0, 0.0],
    similarity: 0.4,
    smoothness: 0.075,
    spill: 0.3,
  },
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLContext | null>(null);
  const rafRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const { startFrame, endFrame, isActiveFrame } = useMemo(
    () => ({
      startFrame: Math.floor(startTimeInSeconds * fps),
      endFrame: durationInSeconds
        ? Math.floor((startTimeInSeconds + durationInSeconds) * fps)
        : durationInFrames,
      isActiveFrame:
        frame >= Math.floor(startTimeInSeconds * fps) &&
        frame <
          (durationInSeconds
            ? Math.floor((startTimeInSeconds + durationInSeconds) * fps)
            : durationInFrames),
    }),
    [startTimeInSeconds, durationInSeconds, fps, frame, durationInFrames]
  );

  const initGL = useCallback(() => {
    if (typeof window === "undefined" || !isChromaKeyEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const gl = canvas.getContext("webgl2", {
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default",
        preserveDrawingBuffer: true,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        depth: false,
        stencil: false,
      });

      if (!gl) {
        throw new Error("WebGL2 not available");
      }

      const context = createChromaKeyShader({
        width,
        height,
        ...chromaKeyConfig,
      }).initGL(canvas);

      glRef.current = context;
    } catch (error) {
      console.error("WebGL init failed:", error);
    }
  }, [width, height, chromaKeyConfig, isChromaKeyEnabled]);

  const renderFrame = useCallback(
    (timestamp: number) => {
      if (!isActiveFrame || !isPlaying) return;

      if (isChromaKeyEnabled) {
        // Render with chroma key processing
        const ctx = glRef.current;
        const video = videoRef.current;
        if (!ctx || !video) return;

        const { gl, program, vao, texture } = ctx;

        const elapsed = timestamp - lastFrameTimeRef.current;
        if (elapsed < 1000 / 60) {
          rafRef.current = requestAnimationFrame(renderFrame);
          return;
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        try {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video
          );
        } catch (error) {
          console.error("Texture update error:", error);
          return;
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        lastFrameTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(renderFrame);
      }
      // When chroma key is disabled, we don't need to do anything here
      // as the video will play directly
    },
    [isActiveFrame, isPlaying, isChromaKeyEnabled]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoReady = async () => {
      setIsVideoReady(true);
      if (isActiveFrame && isPlaying) {
        try {
          video.playbackRate = 1.0;
          await video.play();
          if (isChromaKeyEnabled) {
            rafRef.current = requestAnimationFrame(renderFrame);
          }
        } catch (err) {
          console.error("Video playback error:", err);
        }
      }
    };

    video.addEventListener("loadedmetadata", handleVideoReady);
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.src = src;
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoReady);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      video.pause();
      video.src = "";
      video.load();
    };
  }, [src, isActiveFrame, renderFrame, isPlaying, isChromaKeyEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady || !isActiveFrame) return;

    if (isPlaying) {
      video.play().catch(console.error);
      if (isChromaKeyEnabled) {
        rafRef.current = requestAnimationFrame(renderFrame);
      }
    } else {
      video.pause();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActiveFrame, isVideoReady, renderFrame, isPlaying, isChromaKeyEnabled]);

  useEffect(() => {
    if (!isChromaKeyEnabled) {
      // Cleanup WebGL context if chroma key is disabled
      if (glRef.current) {
        glRef.current.destroy();
        glRef.current = null;
      }
      return;
    }

    let destroyed = false;

    const cleanup = () => {
      if (glRef.current) {
        glRef.current.destroy();
        glRef.current = null;
      }
    };

    const init = async () => {
      try {
        await initGL();
        if (!destroyed) {
          // Continue initialization
        }
      } catch (error) {
        console.error("Initialization failed:", error);
        cleanup();
      }
    };

    init();

    return () => {
      destroyed = true;
      cleanup();
    };
  }, [initGL, isChromaKeyEnabled]);

  if (!isActiveFrame) return null;

  const commonStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: `translate(${position.x ? `${position.x}%` : "-50%"}, ${
      position.y ? `${position.y}%` : "-50%"
    }) scale(${scale})`,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
  };

  return (
    <AbsoluteFill>
      {isChromaKeyEnabled ? (
        // Render with chroma key processing
        <>
          <video
            ref={videoRef}
            style={{ display: "none" }}
            muted
            playsInline
            loop={loop}
            crossOrigin="anonymous"
            preload="auto"
          />
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={commonStyle}
          />
        </>
      ) : (
        // Render video directly without chroma key processing
        <video
          ref={videoRef}
          style={commonStyle}
          muted
          playsInline
          loop={loop}
          crossOrigin="anonymous"
          preload="auto"
        />
      )}
    </AbsoluteFill>
  );
};

export default React.memo(ChromaKeyEffect);
