import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { generateOTP, sendOTP } from '@/lib/smsir'
import {
  claimResendCooldown,
  consumeOTP,
  releaseResendCooldown,
  setOTP,
  checkRateLimit,
} from '@/lib/redis'
import { isValidIranianPhone, toEnglishDigits } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const { phone: rawPhone } = await request.json()

    if (!rawPhone || !isValidIranianPhone(rawPhone)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست (مثال: 09123456789)' },
        { status: 400 },
      )
    }

    const phone = toEnglishDigits(rawPhone)
    const cooldownToken = randomUUID()
    const cooldown = await claimResendCooldown(phone, cooldownToken)
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
      await releaseResendCooldown(phone, cooldownToken)
      return NextResponse.json(
        {
          error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 },
      )
    }

    const code = generateOTP()
    try {
      await setOTP(phone, code)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[OTP] ${phone}: ${code}`)
      }
      if (process.env.SMSIR_API_KEY === 'your-smsir-api-key' || !process.env.SMSIR_API_KEY) {
        console.log(`[DEV] Skipping SMS send (no API key)`)
      } else {
        await sendOTP(phone, code)
      }
    } catch (error) {
      await consumeOTP(phone, code)
      await releaseResendCooldown(phone, cooldownToken)
      throw error
    }

    return NextResponse.json({ success: true, message: 'کد تأیید ارسال شد' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'ارسال کد تأیید با خطا مواجه شد' }, { status: 500 })
  }
}
