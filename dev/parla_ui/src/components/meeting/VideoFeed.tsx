"use client";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import GlassPanel from "@/components/ui/GlassPanel";
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
  video?: boolean;
};

type Props = {
  socket: Socket;
  roomId: string;
  userName: string;
};

export default function VideoFeed({ socket, roomId, userName }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myId, setMyId] = useState<string>("");

  // const handleStart = async () => {
  //   await fetch("/api/detection/start", { method: "POST" });
  //   setStreaming(true);
  // };

  // const handleStop = async () => {
  //   // await fetch("/api/detection/stop", { method: "POST" });
  //   setStreaming(false);
  //   if (imgRef.current) {
  //     imgRef.current.src = "";
  //   }
  // };

  const handleToggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    socket.emit("toggle-camera", {
      roomId,
      userId: myId,
      video: newState,
    });
  };

  const handleEndCall = () => {
    // Cleanup resources
    socket.emit("leave-room", { roomId, userId: myId }); // Notify the server
    socket.disconnect(); // Disconnect the socket

    // Stop the webcam stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // Redirect to the home page
    redirect("/home_page");
  };

  useEffect(() => {
    fetch("/api/socket");

    const joinRoom = async () => {
      const id = socket.id;
      if (id !== undefined) {
        setMyId(id);
      }

      const streamURL = `http://localhost:5000/video_feed?user=${id}`;

      setParticipants([{ id: id!, url: streamURL, name: userName }]);

      socket.emit("join-room", {
        roomId,
        streamURL,
        userName,
        video: true,
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
        return [...prev, { id, url, name, video: true }];
      });
    });

    socket.on("user-left", (id: string) => {
      setParticipants((prev) => prev.filter((s) => s.id !== id));
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

  useEffect(() => {
    let stream: MediaStream;
    let interval: NodeJS.Timeout;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current!.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve(true);
            };
          });
        }
        // setTimeout(() => {
        interval = setInterval(() => {
          if (!canvasRef.current || !videoRef.current) return;

          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");
          if (!context) return;

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          context.drawImage(
            videoRef.current,
            0,
            0,
            canvas.width,
            canvas.height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) return;

              const formData = new FormData();
              formData.append("frame", blob, "frame.webp");

              fetch(`http://localhost:5000/upload_frame?user=${myId}`, {
                method: "POST",
                body: formData,
              }).catch((err) => console.error("Frame send error:", err));
            },
            "image/webp",
            0.7
          );
        }, 100);
        // }, 1000);
      } catch (error) {
        console.error("Webcam error:", error);
      }
    };

    if (videoEnabled && streaming && myId) {
      startWebcam();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [streaming, videoEnabled, myId]);

  // useEffect(() => {
  //   const startDetection = async () => {
  //     try {
  //       const res = await fetch("/api/detection/start", { method: "POST" });
  //       if (!res.ok) throw new Error("Failed to start detection");
  //       setStreaming(true);
  //     } catch (err) {
  //       console.error("Start error", err);
  //     }
  //   };

  //   if (videoEnabled) {
  //     startDetection();
  //   } else {
  //     handleStop();
  //   }
  // }, [videoEnabled]);

  useEffect(() => {
    if (videoEnabled) {
      setStreaming(true);
    } else {
      setStreaming(false);
    }
  }, [videoEnabled]);

  useEffect(() => {
    console.log("videoEnabled:", videoEnabled);
    console.log("streaming:", streaming);
    console.log("myId:", myId);
  }, [videoEnabled, streaming, myId]);

  return (
    <GlassPanel className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl min-w-0 h-3/4">
      <div className="flex flex-col gap-5 w-full relative h-full items-center justify-between overflow-hidden">
        <div className="flex min-h-0 justify-center w-full h-full">
          <div className="bg-[#2B3E51]/70 relative h-auto min-h-0 max-h-full max-w-full flex items-center justify-center rounded-xl aspect-video">
            {myId && streaming && videoEnabled ? (
              // <Webcam
              //   key={userName}
              //   ref={webcamRef}
              //   className="w-full h-full object-cover rounded-xl"
              // />

              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="hidden"
                />
                <canvas ref={canvasRef} className="hidden" />
                <img
                  key={myId}
                  ref={imgRef}
                  src={`http://localhost:5000/video_feed?user=${myId}`}
                  alt="My camera"
                  className="w-full h-full object-cover rounded-xl"
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
              <PrimaryButton onClick={() => setAudioEnabled(!audioEnabled)}>
                {audioEnabled ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} color="#ff007f" />
                )}
              </PrimaryButton>

              <PrimaryButton onClick={handleToggleVideo}>
                {videoEnabled ? (
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

        <div className="gap-2 flex items-center justify-center rounded-full">
          {participants
            .filter((user) => user.id !== myId)
            .map((user) => (
              <div
                key={user.name}
                className="relative w-56 max-w-56 overflow-x-auto bg-[#2B3E51]/70 h-auto min-h-0 max-h-full flex items-center justify-center rounded-xl aspect-video"
              >
                <div className="absolute bottom-1 left-1/2 bg-[#4178BC]/60 -translate-x-1/2 flex gap-3 text-white rounded-xl">
                  <div className="mx-2 text-white">{user.name}</div>
                  {/* <div className="flex absolute top-0 left-0  text-xl p-1 rounded-tl-xl rounded-br-xl items-center"> */}
                </div>
                {user.video !== false ? (
                  <img
                    key={user.id}
                    // ref={imgRef}
                    src={`${user.url}&t=${Date.now()}`}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-xl aspect-video"
                  />
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
    </GlassPanel>
  );
}
