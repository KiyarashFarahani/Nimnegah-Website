const SANDBOX_BASE = 'https://sandbox.zarinpal.com/pg/v4'
const LIVE_BASE = 'https://payment.zarinpal.com/pg/v4'

function getBaseUrl() {
  return process.env.ZARINPAL_SANDBOX === 'true' ? SANDBOX_BASE : LIVE_BASE
}

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
  const merchantId = process.env.ZARINPAL_MERCHANT_ID!
  const isSandbox = process.env.ZARINPAL_SANDBOX === 'true'
  const baseUrl = getBaseUrl()
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`

  const response = await fetch(`${baseUrl}/payment/request.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: amount,
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
    const redirectUrl = isSandbox
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
  const merchantId = process.env.ZARINPAL_MERCHANT_ID!
  const baseUrl = getBaseUrl()

  const response = await fetch(`${baseUrl}/payment/verify.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: amount,
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
