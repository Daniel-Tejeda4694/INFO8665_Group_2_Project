"use client";
import { useEffect, useState } from "react";

interface TranscribeProps {
  userName: string;
  roomId: string;
  language: string;
}

export default function Transcribe({
  userName,
  roomId,
  language,
}: TranscribeProps) {
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/transcript/latest?room=${roomId}&user=${userName}&lang=${language}`
        );
        const data = await res.json();
        setTranscript(data.text);
      } catch (err) {
        console.error("Transcript fetch error:", err);
      }
    }, 300); // Reduce interval to 300ms for near real-time updates

    return () => clearInterval(interval);
  }, [userName, roomId, language]);

  if (!transcript) return null;

  return (
    <div className="bg-[#2B3E51]/70 bg-opacity-80 text-white text-lg px-6 py-3 rounded-xl max-w-xl text-center w-full">
      {userName}: {transcript}
    </div>
  );
}
