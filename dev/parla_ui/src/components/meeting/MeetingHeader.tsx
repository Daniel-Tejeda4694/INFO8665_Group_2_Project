"use client";
import React from "react";
import ParlaLogo from "@/components/home/ParlaLogo"; //  Import logo component

import { useState } from "react";
// import { useParams } from "next/navigation";

import { FaUserPlus } from "react-icons/fa";
import PrimaryButton from "../ui/PrimaryButton";

type Props = {
  roomId: string;
};

export default function MeetingHeader({ roomId }: Props) {
  const [copied, setCopied] = useState(false);
  // const { roomId } = useParams();

  const handleCopy = async () => {
    const link = roomId;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset after 2 seconds
  };

  return (
    <div className="flex items-center justify-between mr-2">
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
            {copied ? "Copied meeting code" : "Copy meeting code"}
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
