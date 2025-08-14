"use client";
import React from "react";

const EMOJI_MAP: Record<string, string> = {
  Angry: "/emojis/Angry.png",
  Happy: "/emojis/Happy.png",
  Neutral: "/emojis/Neutral.png",
  Sad: "/emojis/Sad.png",
  Surprise: "/emojis/Surprise.png",
};

export default function WebcamWithEmojiOverlay({ wsUrl }: { wsUrl: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoCanvasRef = React.useRef<HTMLCanvasElement>(null); // for sending frames
  const overlayCanvasRef = React.useRef<HTMLCanvasElement>(null); // for drawing emojis
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [latestEmotion, setLatestEmotion] = React.useState<{
    label: string;
    bbox: { x: number; y: number; w: number; h: number };
  } | null>(null);

  // preload emoji images
  const emojiImages = React.useMemo(() => {
    const imgs: Record<string, HTMLImageElement> = {};
    for (const label in EMOJI_MAP) {
      const img = new Image();
      img.src = EMOJI_MAP[label];
      imgs[label] = img;
    }
    return imgs;
  }, []);

  // Setup WebSocket
  React.useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socket.binaryType = "arraybuffer";
    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "emotion") {
            setLatestEmotion({ label: payload.label, bbox: payload.bbox });
          }
        } catch (e) {
          console.error("Error parsing message", e);
        }
      }
    };

    socket.onclose = () => console.log("WebSocket disconnected");
    setWs(socket);
    return () => socket.close();
  }, [wsUrl]);

  // Get camera stream
  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera error", err));
  }, []);

  // Send frames at interval
  React.useEffect(() => {
    const sendInterval = setInterval(() => {
      if (
        !videoCanvasRef.current ||
        !videoRef.current ||
        !ws ||
        ws.readyState !== WebSocket.OPEN
      )
        return;

      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (
        canvas.width !== videoRef.current.videoWidth ||
        canvas.height !== videoRef.current.videoHeight
      ) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          blob.arrayBuffer().then((ab) => {
            try {
              ws.send(ab);
            } catch (err) {
              console.error("WS send error", err);
            }
          });
        },
        "image/webp",
        0.6
      );
    }, 100);

    return () => clearInterval(sendInterval);
  }, [ws]);

  // Draw emoji overlay smoothly
  React.useEffect(() => {
    let animationFrameId: number;

    function drawLoop() {
      if (!overlayCanvasRef.current || !videoRef.current) {
        animationFrameId = requestAnimationFrame(drawLoop);
        return;
      }

      const canvas = overlayCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(drawLoop);
        return;
      }

      if (
        canvas.width !== videoRef.current.videoWidth ||
        canvas.height !== videoRef.current.videoHeight
      ) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (latestEmotion) {
        const { label, bbox } = latestEmotion;
        if (bbox && label) {
          const x = bbox.x * canvas.width;
          const y = bbox.y * canvas.height;
          const w = bbox.w * canvas.width;
          const h = bbox.h * canvas.height;

          const emojiSize = Math.max(24, Math.min(128, Math.round(h * 0.8)));
          const img = emojiImages[label] || emojiImages["Neutral"];

          if (img.complete) {
            const drawX = Math.min(canvas.width - emojiSize, x + w + 8);
            const drawY = Math.max(0, y);
            ctx.drawImage(img, drawX, drawY, emojiSize, emojiSize);
          }
        }
      }

      animationFrameId = requestAnimationFrame(drawLoop);
    }

    animationFrameId = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [latestEmotion, emojiImages]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover rounded-xl"
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none"
      />
      <canvas ref={videoCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
