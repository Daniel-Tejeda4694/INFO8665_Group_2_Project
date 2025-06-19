"use client";
import React from "react";
import ParlaLogo from "@/components/home/ParlaLogo"; //  Import logo component

import { useState } from "react";

import { FaUserPlus } from "react-icons/fa";
import PrimaryButton from "../ui/PrimaryButton";

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
        <ParlaLogo />
      </div>
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
