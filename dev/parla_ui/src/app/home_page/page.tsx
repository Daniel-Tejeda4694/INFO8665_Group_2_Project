'use client'
import { useRouter } from 'next/navigation'
import ParlaLogo from '@/components/home/ParlaLogo'
import PrimaryButton from '@/components/ui/PrimaryButton'



export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#f7f7f8] flex flex-col items-center justify-center text-center px-4">
      <ParlaLogo />
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
        A real-time voice and emotion translation system for everyone
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Reach out from any language with Parla
      </p>
      <div className="flex flex-wrap gap-4">
        <PrimaryButton onClick={() => router.push('/setting_page')}>
          ➕<span className="ml-2">New meeting</span>
        </PrimaryButton>
        <input
          className="px-5 py-3 rounded-full border border-gray-300 shadow text-gray-700 w-64"
          type="text"
          placeholder="Enter a code or link"
        />
        <button
          className="px-6 py-3 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-100"
          onClick={() => router.push('/setting_page')}
        >        
        Join
        </button>
      </div>
    </main>
  )
}
