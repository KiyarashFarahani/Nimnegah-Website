const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true'

const SANDBOX_BASE = 'https://sandbox.zarinpal.com/pg/v4'
const LIVE_BASE = 'https://payment.zarinpal.com/pg/v4'

const baseUrl = ZARINPAL_SANDBOX ? SANDBOX_BASE : LIVE_BASE

type InitializePaymentResult =
  | { success: true; redirectUrl: string; authority: string }
  | { success: false; error: string }

type VerifyPaymentResult =
  | { success: true; refId: number; cardPan: string }
  | { success: false; error: string; code: number }

export async function initializePayment(
  amount: number,
  description: string,
  metadata?: { mobile?: string; email?: string; orderId?: string },
): Promise<InitializePaymentResult> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`

  const response = await fetch(`${baseUrl}/payment/request.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: amount * 10,
      callback_url: callbackUrl,
      description: description,
      currency: 'IRT',
      metadata: {
        mobile: metadata?.mobile,
        email: metadata?.email,
        order_id: metadata?.orderId,
      },
    }),
  })

  const data = await response.json()

  if (data.data?.code === 100 || data.data?.code === 101) {
    const authority = data.data.authority
    const redirectUrl = ZARINPAL_SANDBOX
      ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
      : `https://www.zarinpal.com/pg/StartPay/${authority}`
    return { success: true, redirectUrl, authority }
  }

  const errorMsg = data.errors?.[0]?.message || data.data?.message || 'پرداخت ناموفق بود'
  return { success: false, error: errorMsg }
}

export async function verifyPayment(
  authority: string,
  amount: number,
): Promise<VerifyPaymentResult> {
  const response = await fetch(`${baseUrl}/payment/verify.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: amount * 10,
      authority: authority,
    }),
  })

  const data = await response.json()

  if (data.data?.code === 100 || data.data?.code === 101) {
    return {
      success: true,
      refId: data.data.ref_id,
      cardPan: data.data.card_pan || '',
    }
  }

  const errorMsg = data.errors?.[0]?.message || data.data?.message || 'تأیید پرداخت ناموفق بود'
  return { success: false, error: errorMsg, code: data.data?.code || -1 }
}
