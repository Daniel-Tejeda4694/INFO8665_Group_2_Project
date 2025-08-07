"use client";
import MeetingHeader from "@/components/meeting/MeetingHeader";
import VideoFeed from "@/components/meeting/VideoFeed";
import Transcribe from "@/components/meeting/Transcribe";
import GlassPanel from "@/components/ui/GlassPanel";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useSearchParams } from "next/navigation";

type Participant = {
  id: string;
  url: string;
  name: string;
  audio?: boolean;
  video?: boolean;
};

export default function MeetingPage() {
  const params = useParams() as { roomId: string };
  const roomId = params.roomId;
  const [participants, setParticipants] = useState<Participant[]>([]);

  const search = useSearchParams();
  const userName = search!.get("name")!;
  const language = search!.get("lang") ?? "en"; // default english
  const audioEnabled = search!.get("audio") !== "0"; // default true
  const videoEnabled = search!.get("video") !== "0"; // default true

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userName) return;

    const s = io("http://localhost:3000", {
      path: "/api/socket",
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userName, roomId]);

  if (!userName || !socket) {
    return <></>;
  }

  return (
    <main className="min-h-screen">
      <MeetingHeader roomId={roomId} />

      <GlassPanel className="p-3 flex mr-[80px] ml-[80px] max-w-full h-3/4 max-h-[85vh] min-h-0 gap-x-3 min-w-0">
        <div className="basis-2/3 flex flex-col">
          <VideoFeed
            socket={socket}
            roomId={roomId}
            userName={userName}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            participants={participants}
            setParticipants={setParticipants}
          />

          {/* STT display */}
          <div className="bg-[#2B3E51]/70 w-full bg-opacity-80 rounded-xl p-4 shadow text-black text-center text-lg overflow-y-auto">
            <Transcribe
              userName={userName}
              roomId={roomId}
              language={language}
            />
          </div>
        </div>
        <div className="w-full basis-1/3 flex">
          <div className="bg-[#2B3E51]/70 w-full rounded-xl justify-between p-3 flex flex-col gap-y-5">
            <p className="text-2xl font-semibold mb-2">
              Participants ({participants.length})
            </p>
            <p className="text-2xl font-semibold mb-2">Chat</p>
          </div>
        </div>
      </GlassPanel>
    </main>
  );
}
