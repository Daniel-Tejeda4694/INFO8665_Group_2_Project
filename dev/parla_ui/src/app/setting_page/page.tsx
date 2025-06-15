'use client'
import { useRouter } from 'next/navigation'

export default function SettingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-2xl font-bold mb-6">Meeting Settings</h1>
      <p className="text-gray-600 mb-8">Please check your camera, microphone, and language preferences before joining.</p>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700"
        onClick={() => router.push('/meeting_page')}
      >
        Complete
      </button>
    </main>
  )
}