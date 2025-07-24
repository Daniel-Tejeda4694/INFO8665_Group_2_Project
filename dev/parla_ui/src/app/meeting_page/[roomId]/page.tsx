"use client";
import MeetingHeader from "@/components/meeting/MeetingHeader";
import VideoFeed from "@/components/meeting/VideoFeed";
import Transcribe from "@/components/meeting/Transcribe";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useSearchParams } from "next/navigation";

export default function MeetingPage() {
  const params = useParams() as { roomId: string };
  const roomId = params.roomId;

  const search = useSearchParams();
  const userName = search!.get("name")!;
  const language = search!.get("lang") ?? "en"; // default english

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

  // return (
  //   <main className="min-h-screen">
  //     <MeetingHeader />
  //     <VideoFeed socket={socket} roomId={roomId} userName={userName} />
  //   </main>
  // );
   return (
    <main className="min-h-screen bg-gray-50">
      <MeetingHeader />

      <div className="flex flex-col items-center space-y-6 mt-6">
        <VideoFeed socket={socket} roomId={roomId} userName={userName} />

        {/* STT display */}
        <div className="w-4/5 bg-white bg-opacity-80 rounded-xl p-4 shadow text-black text-center text-lg max-h-40 overflow-y-auto">
          <Transcribe roomId={roomId} language={language} />
        </div>
      </div>
    </main>
  );
}
