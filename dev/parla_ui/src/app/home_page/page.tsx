"use client";
import ParlaLogo from "@/components/home/ParlaLogo";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GlassPanel from "@/components/ui/GlassPanel";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleNewMeeting = () => {
    const newRoomId = uuidv4();
    router.push(`/setting_page?room=${newRoomId}`);
  };

  const handleJoin = async () => {
    if (roomCode) {
      router.push(`/setting_page?room=${roomCode}`);
    } else {
      setError("Invalid room code");
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-[#ece5d8]"
      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
    >
      <ParlaLogo />
      <GlassPanel className="flex flex-col items-center justify-center absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-3/4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          Real-time voice and emotion translation system
        </h1>
        <p className="text-2xl font-semibold mb-20">
          Reach out from any language with Parla
        </p>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton onClick={handleNewMeeting}>
            <FaPlus></FaPlus>
            <span className="ml-2">New meeting</span>
          </PrimaryButton>
          <input
            className="px-5 py-3 rounded-full border text-white border-gray-300 focus:outline-none"
            type="text"
            placeholder="Enter a code or link"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value);
              setInputValue(e.target.value);
              setError("");
            }}
          />
          <button
            disabled={!inputValue.trim()}
            className={`px-4 py-2 rounded-full cursor-auto transition 
          ${
            inputValue.trim()
              ? "border border-gray-300 text-white hover:bg-[#4178BC]/30 cursor-pointer transition"
              : "text-white/50 cursor-auto"
          }`}
            onClick={handleJoin}
          >
            Join
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </GlassPanel>
    </main>
  );
}
