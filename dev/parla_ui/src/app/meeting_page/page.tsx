"use client";

import { useState } from 'react';
import Head from 'next/head';

export default function MeetingPage() {
  const [streaming, setStreaming] = useState(false);

  const handleStart = async () => {
    await fetch('/api/detection/start', { method: 'POST' });
    setStreaming(true);
  };

  const handleStop = async () => {
    await fetch('/api/detection/stop', { method: 'POST' });
    setStreaming(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <Head>
        <title>Parla Emotion Detection</title>
      </Head>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting Room</h1>
      <p className="text-gray-600 mb-6">Welcome to your meeting. Click below to begin real-time emotion detection.</p>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleStart}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
        >
          Start Detection
        </button>
        <button
          onClick={handleStop}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
        >
          Stop Detection
        </button>
      </div>

      {streaming && (
        <div className="border rounded shadow-lg overflow-hidden">
          <img
            src="http://localhost:5000/video_feed"
            alt="Emotion Stream"
            className="w-[640px] h-[480px] object-cover"
          />
        </div>
      )}
    </main>
  );
}
