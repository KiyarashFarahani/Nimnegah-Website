const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true'

const SANDBOX_URL = 'https://sandbox.zarinpal.com/pg/rest/WebGate'
const LIVE_URL = 'https://api.zarinpal.com/pg/rest/WebGate'

const baseUrl = ZARINPAL_SANDBOX ? SANDBOX_URL : LIVE_URL

export async function initializePayment(
  amount: number,
  description: string,
  mobile?: string,
  email?: string,
) {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`

  const response = await fetch(`${baseUrl}/PaymentRequest.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      MerchantID: ZARINPAL_MERCHANT_ID,
      Amount: amount * 10,
      CallbackURL: callbackUrl,
      Description: description,
      Mobile: mobile,
      Email: email,
    }),
  })

  const data = await response.json()

  if (data.Status === 100 || data.Status === 101) {
    const redirectUrl = ZARINPAL_SANDBOX
      ? `https://sandbox.zarinpal.com/pg/StartPay/${data.Authority}`
      : `https://www.zarinpal.com/pg/StartPay/${data.Authority}`
    return { success: true, redirectUrl, authority: data.Authority }
  }

  return { success: false, error: data.Message }
}

export async function verifyPayment(authority: string, amount: number) {
  const response = await fetch(`${baseUrl}/PaymentVerification.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      MerchantID: ZARINPAL_MERCHANT_ID,
      Amount: amount * 10,
      Authority: authority,
    }),
  })

  const data = await response.json()

  if (data.Status === 100 || data.Status === 101) {
    return { success: true, refId: data.RefID }
  }

  return { success: false, error: data.Message }
}
