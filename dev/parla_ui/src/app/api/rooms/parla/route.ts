import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  const { roomId } = params

  // 🔒 Replace this with real room validation logic (e.g., DB check)
  const validRooms = ['room123', 'team42', 'parla-room']

  const isValid = validRooms.includes(roomId)

  return NextResponse.json({ valid: isValid })
}