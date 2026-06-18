import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secretUint8 = new TextEncoder().encode(process.env.PAYLOAD_SECRET!)
    const { payload: jwtPayload } = await jwtVerify(token, secretUint8)
    const userId = jwtPayload.id as number

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'users',
      id: userId,
      data: { name: name.trim() },
    })

    return NextResponse.json({
      user: { id: updated.id, phone: updated.phone, name: updated.name, role: updated.role },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
