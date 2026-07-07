const SMSIR_API_KEY = process.env.SMSIR_API_KEY!
const SMSIR_LINE_NUMBER = process.env.SMSIR_LINE_NUMBER!
const SMSIR_TEMPLATE_ID = process.env.SMSIR_TEMPLATE_ID!

import { randomInt } from 'crypto'

export function generateOTP(): string {
  return randomInt(100000, 1000000).toString()
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  const response = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SMSIR_API_KEY}`,
    },
    body: JSON.stringify({
      mobile: phone,
      templateId: Number(SMSIR_TEMPLATE_ID),
      parameters: [{ name: 'CODE', value: code }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SMS send failed: ${error}`)
  }
}
