import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
};

export default function PrimaryButton({ children, onClick }: Props) {
  return (
    <button
      className="bg-[#4178BC]/80 text-white px-6 py-3 rounded-full shadow flex items-center hover:bg-[#4178BC] transition cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
