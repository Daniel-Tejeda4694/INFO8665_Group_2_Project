"use client";
import Webcam from "react-webcam";
import GlassPanel from "@/components/ui/GlassPanel";
import ParlaLogo from "@/components/home/ParlaLogo"; //  Import logo component

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaGlobe,
} from "react-icons/fa";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function MeetingPreview() {
  const webcamRef = useRef<Webcam | null>(null);
  const router = useRouter();

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string | undefined>();
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [name, setName] = useState("");

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audios = devices.filter((d) => d.kind === "audioinput");
      const videos = devices.filter((d) => d.kind === "videoinput");
      setAudioDevices(audios);
      setVideoDevices(videos);
      if (audios.length > 0) setSelectedAudio(audios[0].deviceId);
      if (videos.length > 0) setSelectedVideo(videos[0].deviceId);
    });
  }, []);

  const handleJoin = () => {
    const roomId = "parla"; // or pull from an API/create-room endpoint
    router.push(`/meeting_page/${roomId}?name=${name}`);
  };

  return (
    <main className="min-h-screen">
      <ParlaLogo />
      <GlassPanel className="relative top-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-3/4">
        {/* Camera Preview */}

        <div className="flex flex-row flex-1 mt-15">
          <div className="bg-[#2B3E51]/70 basis-2/5 flex-1 min-w-0 relative w-full h-full max-h-full max-w-full flex flex-col items-center justify-center rounded-4xl aspect-video">
            <h2 className="text-2xl font-bold text-center my-5 absolute -translate-y-55">
              Set up your call before joining
            </h2>
            {videoEnabled ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover rounded-4xl"
                videoConstraints={
                  selectedVideo
                    ? { deviceId: selectedVideo }
                    : { facingMode: "user" }
                }
              />
            ) : (
              <div className="text-white text-xl">No camera found</div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <PrimaryButton onClick={() => setAudioEnabled(!audioEnabled)}>
                {audioEnabled ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} color="#ff007f" />
                )}
              </PrimaryButton>

              <PrimaryButton onClick={() => setVideoEnabled((prev) => !prev)}>
                {videoEnabled ? (
                  <FaVideo size={20} />
                ) : (
                  <FaVideoSlash size={20} color="#ff007f" />
                )}
              </PrimaryButton>
            </div>
          </div>

          <div className="flex flex-col basis-1/3 flex-1 p-4 items-center">
            {/* Dropdown Row */}
            <div className="flex flex-col gap-5 mb-5 flex-1 relative ">
              {/* Name */}
              <div className="w-full md:w-1/3">
                <label className="flex items-center gap-2 mb-2 text-lg">
                  Name:
                </label>
                <input
                  className="px-5 py-3 rounded-full border text-white border-[#486684] w-100 focus:ring-[#6893be] focus:shadow-none"
                  type="text"
                  placeholder="Enter your name"
                  // value={roomCode}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </div>
              {/* Audio Device */}
              <div className="w-full md:w-1/3">
                <label className="flex items-center gap-2 mb-2 text-sm">
                  <FaMicrophone /> Microphone
                </label>
                <select
                  className="px-5 py-3 rounded-full border bg-[#2B3E51]/80 text-white border-[#486684] w-100 focus:outline-none"
                  value={selectedAudio}
                  onChange={(e) => setSelectedAudio(e.target.value)}
                >
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || "Microphone"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Device */}
              <div className="w-full md:w-1/3">
                <label className="flex items-center gap-2 mb-2 text-sm">
                  <FaVideo /> Camera
                </label>
                <select
                  className="px-5 py-3 rounded-full border bg-[#2B3E51]/80 text-white border-[#486684] w-100 focus:outline-none"
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || "Camera"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Settings */}
              <div className="w-full md:w-1/3">
                <label className="flex items-center gap-2 mb-2 text-sm whitespace-nowrap">
                  <FaGlobe /> Language Settings
                </label>
                <select
                  className="px-5 py-3 rounded-full border w-100 bg-[#2B3E51]/80 text-white border-[#486684] focus:outline-none"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="ml">Malayalam</option>
                  <option value="zh">Mandarin</option>
                  <option value="es">Spanish</option>
                  <option value="ro">Romanian</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <PrimaryButton onClick={() => router.push("/")}>
                Cancel
              </PrimaryButton>
              <PrimaryButton onClick={handleJoin}>Join now</PrimaryButton>
            </div>
          </div>
        </div>
      </GlassPanel>
    </main>
  );
}
