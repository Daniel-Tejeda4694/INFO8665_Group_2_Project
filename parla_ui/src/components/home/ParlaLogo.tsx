import Image from 'next/image'

export default function ParlaLogo() {
  return (
    <div className="absolute top-5 left-5 flex items-center text-2xl font-bold">
      <Image src="/3.png" alt="Parla Logo" width={40} height={40} />
      <span className="ml-2 text-gray-800">Parla</span>
    </div>
  )
}
