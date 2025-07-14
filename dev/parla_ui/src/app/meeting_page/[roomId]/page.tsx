"use client";
import MeetingHeader from "@/components/meeting/MeetingHeader";
import VideoFeed from "@/components/meeting/VideoFeed";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useSearchParams } from "next/navigation";

export default function MeetingPage() {
  const params = useParams() as { roomId: string };
  const roomId = params.roomId;

  const search = useSearchParams();
  const userName = search!.get("name")!;

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
      <MeetingHeader />
      <VideoFeed socket={socket} roomId={roomId} userName={userName} />
    </main>
  );
}
