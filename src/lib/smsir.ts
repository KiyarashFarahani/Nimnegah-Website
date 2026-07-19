import { randomInt } from 'crypto'

export function generateOTP(): string {
  return randomInt(100000, 1000000).toString()
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  const apiKey = process.env.SMSIR_API_KEY!
  const templateId = process.env.SMSIR_TEMPLATE_ID!

  const response = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      mobile: phone,
      templateId: Number(templateId),
      parameters: [{ name: 'CODE', value: code }],
    }),
  })

  const body = await response.json()

  if (process.env.NODE_ENV !== 'production') {
    console.log('[sms.ir] Response:', body)
  }

  if (!response.ok) {
    throw new Error(`SMS send failed: ${JSON.stringify(body)}`)
  }
}
