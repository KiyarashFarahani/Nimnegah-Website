import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const authResult = await payload.auth({
      headers: new Headers({ authorization: `Bearer ${token}` }),
    })

    if (!authResult.user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: { id: authResult.user.id, phone: authResult.user.phone, name: authResult.user.name, role: authResult.user.role },
    })
  } catch (error) {
    console.error('Me route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
