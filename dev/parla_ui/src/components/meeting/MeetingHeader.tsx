"use client";
import React from "react";
import ParlaLogo from "@/components/home/ParlaLogo";
import { useState } from "react";

import { FaUserPlus } from "react-icons/fa";

export default function MeetingHeader() {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const link = `${window.location.origin}/setting_page`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset after 2 seconds
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button className="hover:cursor-pointer">
          <ParlaLogo />
        </button>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center bg-gray-400 rounded-full px-5 py-2 hover:bg-gray-400/70 hover:cursor-pointer text-white"
      >
        <FaUserPlus size={20} />
        <span className="text-sm ml-2">
          {copied ? "Copied invite link" : "Copy invite link"}
        </span>
      </button>
    </div>
  );
}
