import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const secret = process.env.PAYLOAD_SECRET!
    const secretUint8 = new TextEncoder().encode(secret)
    const { payload: jwtPayload } = await jwtVerify(token, secretUint8)

    const userId = jwtPayload.id as number
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const user = await payload.findByID({ collection: 'users', id: userId })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error('Me route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
