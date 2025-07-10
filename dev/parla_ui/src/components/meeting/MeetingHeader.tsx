"use client";
import React from "react";
import ParlaLogo from "@/components/home/ParlaLogo"; //  Import logo component

import { useState } from "react";
// import { useParams } from "next/navigation";

import { FaUserPlus } from "react-icons/fa";
import PrimaryButton from "../ui/PrimaryButton";

export default function MeetingHeader() {
  const [copied, setCopied] = useState(false);
  // const { roomId } = useParams();

  const handleCopy = async () => {
    const link = `${window.location.origin}/setting_page`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset after 2 seconds
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <ParlaLogo />
      </div>
      {/* {roomId && (
        <p className="mt-1 text-sm text-gray-200">
          Room ID:{" "}
          <code className="font-mono bg-black/25 px-1 rounded">{roomId}</code>
        </p>
      )} */}
      <div className="m-5">
        <PrimaryButton onClick={handleCopy}>
          <FaUserPlus size={20} />
          <span className="text-sm ml-2">
            {copied ? "Copied invite link" : "Copy invite link"}
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
