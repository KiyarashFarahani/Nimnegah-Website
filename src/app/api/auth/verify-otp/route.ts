import { NextResponse } from 'next/server'
import { getOTP, deleteOTP, checkRateLimit, resetVerifyFailures } from '@/lib/redis'
import { getPayload, jwtSign, getFieldsToSign } from 'payload'
import config from '@payload-config'
import { COOKIE_NAME } from '@/lib/cookie'
import { isValidIranianPhone } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !isValidIranianPhone(phone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'کد تأیید باید ۶ رقم باشد' }, { status: 400 })
    }

    const rateCheck = await checkRateLimit(phone, 'verify')
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 },
      )
    }

    const storedCode = await getOTP(phone)

    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: 'کد تأیید نادرست یا منقضی شده است' }, { status: 401 })
    }

    await deleteOTP(phone)
    await resetVerifyFailures(phone)

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

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token,
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'تأیید کد با خطا مواجه شد' }, { status: 500 })
  }
}
