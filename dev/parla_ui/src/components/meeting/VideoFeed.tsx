"use client";
import React from "react";

import { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

type Participant = {
  id: string;
  name: string;
  stream?: MediaStream;
  muted: boolean;
  cameraOff: boolean;
};

export default function VideoFeed() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [streaming, setStreaming] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // const handleStart = async () => {
  //   await fetch("/api/detection/start", { method: "POST" });
  //   setStreaming(true);
  // };

  const handleStop = async () => {
    await fetch("/api/detection/stop", { method: "POST" });
    setStreaming(false);
    if (imgRef.current) {
      imgRef.current.src = ""; // clear image src to release old stream
    }
  };

  useEffect(() => {
    const startDetection = async () => {
      try {
        const res = await fetch("/api/detection/start", { method: "POST" });
        if (!res.ok) throw new Error("Failed to start detection");
        setStreaming(true);
      } catch (err) {
        console.error("Start error", err);
      }
    };

    if (videoEnabled) {
      startDetection();
    } else {
      handleStop();
    }
  }, [videoEnabled]);

  const [participants, setParticipants] = useState<Participant[]>([]);
  useEffect(() => {
    setParticipants([
      // {
      //   id: "1",
      //   name: "Alicia Padlock",
      //   muted: false,
      //   cameraOff: false,
      //   stream: undefined,
      // },
      // {
      //   id: "2",
      //   name: "Sri Veronica",
      //   muted: true,
      //   cameraOff: true,
      //   stream: undefined,
      // },
    ]);
  }, []);

  return (
    <div className="flex relative h-full">
      <div className="flex flex-col gap-2 w-full relative h-full rounded-lg items-center justify-between">
        <div className="flex min-h-0 justify-center w-full h-full">
          <div className="bg-gray-300 relative h-full max-h-full max-w-full flex items-center justify-center rounded-4xl aspect-video">
            {streaming ? (
              <img
                key={Date.now()}
                ref={imgRef}
                src={`http://localhost:5000/video_feed?${Date.now()}`}
                alt="Camera Stream"
                className="w-full h-full object-cover rounded-4xl"
              />
            ) : (
              <div className="text-white text-4xl">
                <div className="flex justify-center items-center bg-amber-900 rounded-full w-30 h-30">
                  M
                </div>
              </div>
            )}
            <div className="flex absolute top-3 left-3 bg-gray-500/70 text-white text-xl p-1 rounded-4xl items-center">
              <div className="flex justify-center items-center bg-amber-900 rounded-full w-10 h-10 mr-2">
                M
              </div>
              <div className="mr-3">You</div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-white">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="flex items-center justify-center bg-gray-500/70 p-4 rounded-full hover:bg-gray-500/60 hover:cursor-pointer"
              >
                {audioEnabled ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} color="#ff007f" />
                )}
              </button>

              <button
                onClick={() => setVideoEnabled((prev) => !prev)}
                className="flex items-center justify-center bg-gray-500/70 p-4 rounded-full hover:bg-gray-500/60 hover:cursor-pointer"
              >
                {videoEnabled ? (
                  <FaVideo size={20} />
                ) : (
                  <FaVideoSlash size={20} color="#ff007f" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="relative gap-2 flex items-center justify-center rounded-full">
          {participants.map((p) => (
            <div
              key={p.id}
              className="bg-gray-300 flex items-center justify-center relative max-h-full min-h-0 min-w-2xs rounded-3xl overflow-hidden aspect-video text-white text-4xl"
            >
              {p.stream && !p.cameraOff ? (
                <video
                  ref={(ref) => {
                    if (ref && p.stream) {
                      ref.srcObject = p.stream;
                    }
                  }}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-amber-900 rounded-full w-15 h-15 flex items-center justify-center text-white text-2xl">
                  {p.name[0]}
                </div>
              )}

              {p.muted && (
                <div className="absolute top-2 right-2 bg-gray-500/70 p-1.5 rounded-full">
                  <FaMicrophoneSlash size={20} />
                </div>
              )}
              {/* <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                {p.name}
              </span>  */}
              <span className="justify-center absolute bottom-2 bg-gray-500/70 text-white text-xs p-1.5 px-4 rounded-4xl items-center">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
