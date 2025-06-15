import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClick?: () => void
}

export default function PrimaryButton({ children, onClick }: Props) {
  return (
    <button className="bg-blue-500 text-white px-6 py-3 rounded-full shadow flex items-center hover:bg-blue-600"
    onClick={onClick}
    >
      {children}
    </button>
  )
}
