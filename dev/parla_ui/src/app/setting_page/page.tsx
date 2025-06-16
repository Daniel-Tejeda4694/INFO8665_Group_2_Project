'use client'

import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { useRouter } from 'next/navigation'
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaGlobe,
} from 'react-icons/fa'
import ParlaLogo from '@/components/home/ParlaLogo' //  Import logo component

export default function MeetingPreview() {
  const webcamRef = useRef<Webcam | null>(null)
  const router = useRouter()

  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudio, setSelectedAudio] = useState<string | undefined>()
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>()
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audios = devices.filter((d) => d.kind === 'audioinput')
      const videos = devices.filter((d) => d.kind === 'videoinput')
      setAudioDevices(audios)
      setVideoDevices(videos)
      if (audios.length > 0) setSelectedAudio(audios[0].deviceId)
      if (videos.length > 0) setSelectedVideo(videos[0].deviceId)
    })
  }, [])

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 py-8 space-y-6">
      {/* Logo + Title */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <ParlaLogo /> 
        </div>
        <h2 className="text-2xl font-bold text-gray-800">PARLA MEETING</h2>
      </div>

      {/* Camera Preview */}
      <div className="relative w-full max-w-5xl h-[65vh] bg-black rounded-lg overflow-hidden flex items-center justify-center">
        {videoEnabled ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            className="w-full h-full object-cover"
            videoConstraints={
              selectedVideo
                ? { deviceId: selectedVideo }
                : { facingMode: 'user' }
            }
          />
        ) : (
          <div className="text-center text-gray-400">
            Your camera is turned off
          </div>
        )}

        {/* Icon Buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6 bg-black bg-opacity-60 px-6 py-3 rounded-md text-white">
          {/* Mic Button */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex flex-col items-center"
          >
            {audioEnabled ? (
              <FaMicrophone size={20} />
            ) : (
              <FaMicrophoneSlash size={20} color="#ff007f" />
            )}
            <span className="text-xs mt-1">Audio</span>
          </button>

          {/* Video Button */}
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className="flex flex-col items-center"
          >
            {videoEnabled ? (
              <FaVideo size={20} />
            ) : (
              <FaVideoSlash size={20} color="#ff007f" />
            )}
            <span className="text-xs mt-1">Video</span>
          </button>
        </div>
      </div>

      {/* Dropdown Row */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 w-full max-w-5xl justify-center">
        {/* Audio Device */}
        <div className="w-full md:w-1/3">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-700">
            <FaMicrophone /> Microphone
          </label>
          <select
            className="bg-white border text-black p-2 rounded w-full"
            value={selectedAudio}
            onChange={(e) => setSelectedAudio(e.target.value)}
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || 'Microphone'}
              </option>
            ))}
          </select>
        </div>

        {/* Video Device */}
        <div className="w-full md:w-1/3">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-700">
            <FaVideo /> Camera
          </label>
          <select
            className="bg-white border text-black p-2 rounded w-full"
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || 'Camera'}
              </option>
            ))}
          </select>
        </div>

        {/* Language Settings */}
        <div className="w-full md:w-1/3">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-700">
            <FaGlobe /> Language Settings
          </label>
          <select
            className="bg-white border text-black p-2 rounded w-full"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="ml">Malayalam</option>
            <option value="zh">Mandarin</option>
            <option value="es">Spanish</option>
            <option value="ro">Romanian</option>
            <option value="te">Telugu</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-500 text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => router.push('/meeting_page')}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 text-white"
        >
          Join now
        </button>
      </div>
    </main>
  )
}
