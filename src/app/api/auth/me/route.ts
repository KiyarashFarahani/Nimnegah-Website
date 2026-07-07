import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const result = await authenticateRequest(request)

  if (!result.success) {
    return NextResponse.json({ user: null }, { status: result.status })
  }

  const { user } = result
  return NextResponse.json({
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  })
}
