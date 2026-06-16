import { NextResponse } from 'next/server'
import { generateOTP, sendOTP } from '@/lib/smsir'
import { setOTP } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const code = generateOTP()
    await setOTP(phone, code)

    if (process.env.SMSIR_API_KEY === 'your-smsir-api-key' || !process.env.SMSIR_API_KEY) {
      console.log(`[DEV] OTP for ${phone}: ${code}`)
    } else {
      await sendOTP(phone, code)
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
