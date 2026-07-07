import { NextResponse } from 'next/server'
import { generateOTP, sendOTP } from '@/lib/smsir'
import { setOTP, checkRateLimit, checkResendCooldown, setResendCooldown } from '@/lib/redis'
import { isValidIranianPhone } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone || !isValidIranianPhone(phone)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست (مثال: 09123456789)' },
        { status: 400 },
      )
    }

    const cooldown = await checkResendCooldown(phone)
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: `لطفاً ${cooldown.retryAfter} ثانیه صبر کنید`,
          retryAfter: cooldown.retryAfter,
        },
        { status: 429 },
      )
    }

    const rateCheck = await checkRateLimit(phone, 'send')
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 },
      )
    }

    const code = generateOTP()
    await setOTP(phone, code)
    await setResendCooldown(phone)

    console.log(`[OTP] ${phone}: ${code}`)

    if (process.env.SMSIR_API_KEY === 'your-smsir-api-key' || !process.env.SMSIR_API_KEY) {
      console.log(`[DEV] Skipping SMS send (no API key)`)
    } else {
      await sendOTP(phone, code)
    }

    return NextResponse.json({ success: true, message: 'کد تأیید ارسال شد' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'ارسال کد تأیید با خطا مواجه شد' }, { status: 500 })
  }
}
