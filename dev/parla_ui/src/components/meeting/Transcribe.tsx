"use client";
import { useEffect, useState } from "react";

interface TranscribeProps {
  roomId: string;
  language: string;
}

export default function Transcribe({ roomId, language }: TranscribeProps) {
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcript/latest?room=${roomId}&lang=${language}`);
        const data = await res.json();
        setTranscript(data.text);
      } catch (err) {
        console.error("Transcript fetch error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, language]);

  if (!transcript) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-80 text-white text-lg px-6 py-3 rounded-xl max-w-xl text-center">
      {transcript}
    </div>
  );
}