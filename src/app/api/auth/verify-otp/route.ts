import { NextResponse } from 'next/server'
import { getOTP, deleteOTP } from '@/lib/redis'
import { getPayload, jwtSign, getFieldsToSign } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
    }

    const storedCode = await getOTP(phone)

    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    await deleteOTP(phone)

    const payload = await getPayload({ config })

    const existingUsers = await payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
    })

    let user

    if (existingUsers.docs.length > 0) {
      user = existingUsers.docs[0]
    } else {
      user = await payload.create({
        collection: 'users',
        draft: false,
        data: {
          phone,
          email: `${phone}@nimnegah.local`,
          name: '',
          role: 'student',
        },
      })
    }

    const collectionConfig = payload.collections.users.config

    const fieldsToSign = getFieldsToSign({
      collectionConfig,
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: user as any,
    })

    const { token } = await jwtSign({
      fieldsToSign,
      secret: process.env.PAYLOAD_SECRET!,
      tokenExpiration: 60 * 60 * 24 * 7,
    })

    const cookieName = `${payload.config.cookiePrefix ?? 'payload'}-token`

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token,
    })

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ''
    console.error('Verify OTP error:', message, stack)
    return NextResponse.json({ error: 'Failed to verify OTP', details: message }, { status: 500 })
  }
}
