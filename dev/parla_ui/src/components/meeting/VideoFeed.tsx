"use client";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhone,
} from "react-icons/fa";
import PrimaryButton from "../ui/PrimaryButton";
import { redirect } from "next/navigation";

type Participant = {
  id: string;
  url: string;
  name: string;
  audio?: boolean;
  video?: boolean;
};

type Props = {
  socket: Socket;
  roomId: string;
  userName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
};

export default function VideoFeed({
  socket,
  roomId,
  userName,
  audioEnabled,
  videoEnabled,
  participants,
  setParticipants,
}: Props) {
  // const imgRef = useRef<HTMLImageElement | null>(null);
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null); // for emoji overlay

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const overlayCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>(
    {}
  );
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [latestEmotion, setLatestEmotion] = useState<{
    label: string;
    bbox: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const [emotions, setEmotions] = useState<
    Record<
      string,
      {
        label: string;
        bbox: { x: number; y: number; w: number; h: number };
      } | null
    >
  >({});

  const [myId, setMyId] = useState<string>("");
  const [streaming, setStreaming] = useState(false);
  const [video, setVideo] = useState(videoEnabled);
  const [audio, setAudio] = useState(audioEnabled);

  // TO DO: check the toggle buttons
  const handleToggleAudio = () => {
    setAudio((prev) => {
      const newState = !prev;
      socket.emit("toggle-microphone", {
        roomId,
        userId: myId,
        audio: newState,
      });
      return newState;
    });
  };

  const handleToggleVideo = () => {
    setVideo((prev) => {
      const newState = !prev;
      socket.emit("toggle-camera", {
        roomId,
        userId: myId,
        video: newState,
      });
      return newState;
    });
  };

  const handleEndCall = () => {
    // Cleanup resources
    socket.emit("leave-room", { roomId, userId: myId }); // Notify the server
    socket.disconnect(); // Disconnect the socket

    const currentVideoRef = videoRefs.current[myId];

    // Stop the webcam stream
    if (currentVideoRef && currentVideoRef.srcObject) {
      const stream = currentVideoRef.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // TO DO: Redirect to another page
    redirect("/home");
  };

  const EMOJI_MAP: Record<string, string> = {
    Angry: "/emojis/Angry.png",
    Happy: "/emojis/Happy.png",
    Neutral: "/emojis/Neutral.png",
    Sad: "/emojis/Sad.png",
    Surprise: "/emojis/Surprise.png",
  };

  const emojiImages = React.useMemo(() => {
    const imgs: Record<string, HTMLImageElement> = {};
    for (const label in EMOJI_MAP) {
      const img = new Image();
      img.src = EMOJI_MAP[label];
      imgs[label] = img;
    }
    return imgs;
  }, []);

  // TO DO: check if necessary (maybe this toggles)
  useEffect(() => {
    setVideo(videoEnabled);
  }, [videoEnabled]);

  //Commented out for now - might be useful later
  // useEffect(() => {
  //   const loadPromises = Object.values(emojiImages).map(
  //     (img) =>
  //       new Promise<void>((resolve) => {
  //         if (img.complete) {
  //           resolve();
  //         } else {
  //           img.onload = () => resolve();
  //         }
  //       })
  //   );
  //   Promise.all(loadPromises).then(() => {
  //     console.log("All emojis loaded");
  //     // Start your webcam stream or emotion detection here safely
  //   });
  // }, [emojiImages]);

  // function drawEmojiOverlay(
  //   canvas: HTMLCanvasElement,
  //   video: HTMLVideoElement,
  //   bbox_norm: { x: number; y: number; w: number; h: number } | null,
  //   label: string | null
  // ) {
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // match canvas size to video size only once or when video size changes
  //   if (
  //     canvas.width !== video.videoWidth ||
  //     canvas.height !== video.videoHeight
  //   ) {
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //   }

  //   // clear previous overlay only
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);

  //   if (!bbox_norm || !label) return;

  //   const x = bbox_norm.x * canvas.width;
  //   const y = bbox_norm.y * canvas.height;
  //   const w = bbox_norm.w * canvas.width;
  //   const h = bbox_norm.h * canvas.height;

  //   const emojiSize = Math.max(24, Math.min(128, Math.round(h * 0.8)));

  //   const img = emojiImages[label] || emojiImages["Neutral"];

  //   if (img.complete) {
  //     const drawX = Math.min(canvas.width - emojiSize, x + w + 8);
  //     const drawY = Math.max(0, y);
  //     ctx.drawImage(img, drawX, drawY, emojiSize, emojiSize);
  //   }
  //   // don't set onload handler here, it's only needed once when preloading
  // }

  useEffect(() => {
    fetch("/api/socket");

    const joinRoom = async () => {
      const id = socket.id;
      if (id !== undefined) {
        setMyId(id);
      }

      const streamURL = `http://10.187.85.37:5000/video_feed?user=${id}`;

      setParticipants([{ id: id!, url: streamURL, name: userName }]);

      socket.emit("join-room", {
        roomId,
        streamURL,
        userName,
        video: true,
        audio: true,
      });

      console.log("Emitting join-room with", streamURL, userName);

      // await fetch("/api/detection/start", { method: "POST" });
      setStreaming(true);
    };

    socket.on("existing-users", (users: Participant[]) => {
      console.log("Existing users:", users);
      setParticipants((prev) => {
        const all = [...prev, ...users];
        const seen = new Set<string>();
        return all.filter((user) => {
          if (seen.has(user.id)) return false;
          seen.add(user.id);
          return true;
        });
      });
    });

    socket.on("camera-toggled", ({ id, video }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, video } : p))
      );
    });

    socket.on("user-joined", ({ id, url, name }) => {
      console.log("new user joined:", id, url, name);
      setParticipants((prev) => {
        if (prev.some((u) => u.id === id)) return prev;
        return [...prev, { id, url, name, video: true, audio: true }];
      });
    });

    socket.on("user-left", (id: string) => {
      setParticipants((prev) => prev.filter((s) => s.id !== id));
    });

    socket.on("emotion-update", (payload) => {
      const { id, emotion, bbox } = payload;
      setEmotions((prev) => ({
        ...prev,
        [id]: { label: emotion, bbox },
      }));
    });

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("existing-users");
      socket.off("camera-toggled");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [socket, roomId, userName]);

  // useEffect(() => {
  //   let stream: MediaStream;
  //   let interval: NodeJS.Timeout;

  //   const startWebcam = async () => {
  //     try {
  //       stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         await new Promise((resolve) => {
  //           videoRef.current!.onloadedmetadata = () => {
  //             videoRef.current?.play();
  //             resolve(true);
  //           };
  //         });
  //       }
  //       // setTimeout(() => {
  //       interval = setInterval(() => {
  //         if (!canvasRef.current || !videoRef.current) return;

  //         const canvas = canvasRef.current;
  //         const context = canvas.getContext("2d");
  //         if (!context) return;

  //         canvas.width = videoRef.current.videoWidth;
  //         canvas.height = videoRef.current.videoHeight;

  //         context.drawImage(
  //           videoRef.current,
  //           0,
  //           0,
  //           canvas.width,
  //           canvas.height
  //         );

  //         canvas.toBlob(
  //           (blob) => {
  //             if (!blob) return;

  //             const formData = new FormData();
  //             formData.append("frame", blob, "frame.webp");

  //             fetch(http://10.0.0.124:5000/upload_frame?user=${myId}, {
  //               method: "POST",
  //               body: formData,
  //             }).catch((err) => console.error("Frame send error:", err));
  //           },
  //           "image/webp",
  //           0.7
  //         );
  //       }, 100);
  //       // }, 1000);
  //     } catch (error) {
  //       console.error("Webcam error:", error);
  //     }
  //   };

  //   if (videoEnabled && streaming && myId) {
  //     startWebcam();
  //   }

  //   return () => {
  //     if (interval) clearInterval(interval);
  //     if (stream) stream.getTracks().forEach((t) => t.stop());
  //   };
  // }, [streaming, videoEnabled, myId]);

  useEffect(() => {
    let animationFrameId: number;

    function drawLoop() {
      participants.forEach((user) => {
        const canvas = canvasRefs.current[user.id];
        const overlayCanvas = overlayCanvasRefs.current[user.id];
        const video = videoRefs.current[user.id];
        const emotion = emotions[user.id];

        if (!canvas || !overlayCanvas || !video) return;

        const ctx = canvas.getContext("2d");
        const overlayCtx = overlayCanvas.getContext("2d");
        if (!ctx || !overlayCtx) return;

        // Adjust canvas sizes to match video dimensions
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (
          overlayCanvas.width !== video.videoWidth ||
          overlayCanvas.height !== video.videoHeight
        ) {
          overlayCanvas.width = video.videoWidth;
          overlayCanvas.height = video.videoHeight;
        }

        // Clear canvases
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Draw your normal video processing on ctx if needed here...

        // Draw emoji overlay
        if (emotion && emotion.label && emotion.bbox) {
          const { label, bbox } = emotion;
          const x = bbox.x * overlayCanvas.width;
          const y = bbox.y * overlayCanvas.height;
          const w = bbox.w * overlayCanvas.width;
          const h = bbox.h * overlayCanvas.height;

          const emojiSize = Math.max(24, Math.min(128, Math.round(h * 0.8)));

          const imgEmoji = emojiImages[label] || emojiImages["Neutral"];

          if (imgEmoji.complete) {
            const drawX = Math.min(overlayCanvas.width - emojiSize, x + w + 8);
            const drawY = Math.max(0, y);

            // Maybe fixing the emoji aspect ratio issue
            const aspect = imgEmoji.width / imgEmoji.height;
            const emojiWidth = emojiSize * aspect;
            const emojiHeight = emojiSize;
            overlayCtx.drawImage(
              imgEmoji,
              drawX,
              drawY,
              emojiWidth,
              emojiHeight
            );
          }
        }
      });

      animationFrameId = requestAnimationFrame(drawLoop);
    }

    drawLoop();
    // animationFrameId = requestAnimationFrame(drawLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [participants, emotions, emojiImages]);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let sendInterval: NodeJS.Timeout | undefined;
    let ws: WebSocket | undefined;
    const currentVideoRef = videoRefs.current[myId];
    const currentCanvasRef = canvasRefs.current[myId];

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (currentVideoRef) {
          currentVideoRef.srcObject = stream;
          await new Promise((res) => {
            currentVideoRef!.onloadedmetadata = () => {
              currentVideoRef?.play();
              res(true);
            };
          });
        }

        if (!myId) return;

        const wsUrl = `ws://10.187.85.37:5000/ws?user=${encodeURIComponent(
          myId
        )}`;
        ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";

        ws.onopen = () => console.log("WS connected", wsUrl);

        ws.onmessage = (event) => {
          // Expect JSON text messages with metadata
          if (typeof event.data === "string") {
            try {
              const payload = JSON.parse(event.data);
              if (payload.type === "emotion") {
                const { label, bbox } = payload;
                setLatestEmotion({ label, bbox });

                setEmotions((prev) => ({
                  ...prev,
                  [myId]: { label, bbox },
                }));

                socket.emit("emotion-update", {
                  roomId,
                  id: myId,
                  emotion: label,
                  bbox,
                });
              }
            } catch {}
          }
        };

        ws.onerror = (e) => console.error("WS error", e);

        // send camera frames periodically (same as previously)
        const INTERVAL = 100; // ms capture
        sendInterval = setInterval(() => {
          if (
            !currentCanvasRef ||
            !currentVideoRef ||
            !ws ||
            ws.readyState !== WebSocket.OPEN
          )
            return;
          const canvas = currentCanvasRef;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          if (
            canvas.width !== currentVideoRef.videoWidth ||
            canvas.height !== currentVideoRef.videoHeight
          ) {
            canvas.width = currentVideoRef.videoWidth;
            canvas.height = currentVideoRef.videoHeight;
          }

          ctx.drawImage(currentVideoRef, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob || !ws || ws.readyState !== WebSocket.OPEN) return;
              blob.arrayBuffer().then((ab) => {
                try {
                  ws!.send(ab);
                } catch (err) {
                  console.error("WS send error", err);
                }
              });
            },
            "image/webp",
            0.6
          );
        }, INTERVAL);
      } catch (err) {
        console.error("start webcam error", err);
      }
    };

    if (videoEnabled && streaming && myId) start();

    return () => {
      if (sendInterval) clearInterval(sendInterval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [streaming, videoEnabled, myId]);

  // useEffect(() => {
  //   let animationFrameId: number;

  //   function drawLoop() {
  //     if (!overlayCanvasRef.current || !videoRef.current) {
  //       animationFrameId = requestAnimationFrame(drawLoop);
  //       return;
  //     }

  //     const canvas = overlayCanvasRef.current;
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) {
  //       animationFrameId = requestAnimationFrame(drawLoop);
  //       return;
  //     }

  //     if (
  //       canvas.width !== videoRef.current.videoWidth ||
  //       canvas.height !== videoRef.current.videoHeight
  //     ) {
  //       canvas.width = videoRef.current.videoWidth;
  //       canvas.height = videoRef.current.videoHeight;
  //     }

  //     // clear overlay canvas
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     if (latestEmotion) {
  //       const { label, bbox } = latestEmotion;
  //       if (bbox && label) {
  //         const x = bbox.x * canvas.width;
  //         const y = bbox.y * canvas.height;
  //         const w = bbox.w * canvas.width;
  //         const h = bbox.h * canvas.height;

  //         const emojiSize = Math.max(24, Math.min(80, Math.round(h * 0.8)));

  //         const img = emojiImages[label] || emojiImages["Neutral"];

  //         if (img.complete) {
  //           const drawX = Math.min(canvas.width - emojiSize, x + w + 8);
  //           const drawY = Math.max(0, y);
  //           ctx.drawImage(img, drawX, drawY, emojiSize, emojiSize);
  //         }
  //       }
  //     }

  //     animationFrameId = requestAnimationFrame(drawLoop);
  //   }

  //   animationFrameId = requestAnimationFrame(drawLoop);

  //   return () => cancelAnimationFrame(animationFrameId);
  // }, [latestEmotion, emojiImages]);

  // Debugging logs
  useEffect(() => {
    console.log("videoEnabled:", videoEnabled);
    console.log("streaming:", streaming);
    console.log("myId:", myId);
  }, [videoEnabled, streaming, myId]);

  useEffect(() => {
    if (videoEnabled) {
      setStreaming(true);
    } else {
      setStreaming(false);
    }
  }, [videoEnabled]);

  useEffect(() => {
    setAudio(audioEnabled);
    setVideo(videoEnabled);
  }, [audioEnabled, videoEnabled]);

  useEffect(() => {
    participants.forEach((user) => {
      const video = videoRefs.current[user.id];
      const overlayCanvas = overlayCanvasRefs.current[user.id];

      if (video && overlayCanvas) {
        const setCanvasSize = () => {
          overlayCanvas.width = video.videoWidth;
          overlayCanvas.height = video.videoHeight;
        };

        if (video.readyState >= 1) {
          setCanvasSize();
        } else {
          video.addEventListener("loadedmetadata", setCanvasSize);
        }
      }
    });
  }, [participants]);

  return (
    <div className="flex flex-col gap-5 w-full relative h-full items-center justify-between overflow-hidden">
      <div className="flex min-h-0 justify-center w-full h-full">
        <div className="bg-[#2B3E51]/70 w-full relative min-h-0 aspect-4/2 max-h-full max-w-full flex items-center justify-center rounded-xl">
          {myId && streaming && videoEnabled ? (
            <>
              <video
                key={myId}
                ref={(el) => {
                  videoRefs.current[myId] = el;
                }}
                autoPlay
                muted
                playsInline
                // src={http://10.0.0.124:5000/video_feed?user=${myId}}
                className="w-full h-full object-cover rounded-xl"
              />
              <canvas
                ref={(el) => {
                  canvasRefs.current[myId] = el;
                }}
                className="hidden"
              />
              <canvas
                ref={(el) => {
                  overlayCanvasRefs.current[myId] = el;
                }}
                className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none"
                // width={videoRef.current?.videoWidth}
                // height={videoRef.current?.videoHeight}
              />
            </>
          ) : (
            <div className="text-white text-4xl">
              <div className="flex justify-center items-center bg-[#4178BC]/80 rounded-full w-30 h-30">
                {userName.charAt(0)}
              </div>
            </div>
          )}
          <div className="flex absolute top-0 left-0 bg-[#4178BC]/60 text-xl p-1 rounded-tl-xl rounded-br-xl items-center">
            <div className="mx-2 text-white">You</div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-white">
            <PrimaryButton onClick={handleToggleAudio}>
              {audio ? (
                <FaMicrophone size={20} />
              ) : (
                <FaMicrophoneSlash size={20} color="#ff007f" />
              )}
            </PrimaryButton>
            <PrimaryButton onClick={handleToggleVideo}>
              {video ? (
                <FaVideo size={20} />
              ) : (
                <FaVideoSlash size={20} color="#ff007f" />
              )}
            </PrimaryButton>

            {/* End Call Button */}
            <div
              onClick={handleEndCall}
              className="bg-[#ff007f]/80 text-white px-4 py-4 rounded-full shadow flex items-center hover:bg-[#ff007f] transition cursor-pointer"
            >
              <FaPhone size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="gap-3 flex items-center justify-center rounded-full mb-5">
        {participants
          .filter((user) => user.id !== myId)
          .map((user) => (
            <div
              key={user.name}
              className="relative w-2xs overflow-x-auto bg-[#2B3E51]/70 min-h-[120px] flex items-center justify-center rounded-xl aspect-4/2"
            >
              <div className="absolute bottom-1 left-1/2 bg-[#4178BC]/60 -translate-x-1/2 flex gap-3 text-white rounded-xl">
                <div className="mx-2 text-white">{user.name}</div>
                {/* <div className="flex absolute top-0 left-0  text-xl p-1 rounded-tl-xl rounded-br-xl items-center"> */}
              </div>
              {user.video !== false ? (
                <>
                  <video
                    key={user.id}
                    ref={(el) => {
                      videoRefs.current[user.id] = el;
                    }}
                    autoPlay
                    muted
                    playsInline
                    // src={`http://10.0.0.124:5000/video_feed?user=${user.id}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[user.id] = el;
                    }}
                    className="hidden"
                  />
                  <canvas
                    ref={(el) => {
                      overlayCanvasRefs.current[user.id] = el;
                    }}
                    className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none"
                  />
                </>
              ) : (
                <div className="text-white text-4xl">
                  <div className="flex justify-center items-center bg-[#4178BC]/80 rounded-full w-15 h-15">
                    {user.name.charAt(0)}
                  </div>
                </div>
              )}
            </div>
            // </div>
          ))}
      </div>
    </div>
  );
}
