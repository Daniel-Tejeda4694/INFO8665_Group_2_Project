import Image from "next/image";

export default function ParlaLogo() {
  return (
    <div className="absolute top-8 left-8 flex items-center text-2xl font-bold cursor-pointer">
      <Image src="/logo.png" alt="Parla Logo" width={40} height={40} />
      <span className="ml-2 text-[#D3CCBF]">Parla</span>
    </div>
  );
}
