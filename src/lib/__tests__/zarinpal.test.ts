import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

import { initializePayment, verifyPayment } from '../zarinpal'

describe('initializePayment', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.ZARINPAL_MERCHANT_ID = 'test-merchant-id'
    process.env.ZARINPAL_SANDBOX = 'true'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  it('sends correct request to Zarinpal API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, authority: 'A001' } }),
    } as Response)

    await initializePayment(500000, 'Test course', { mobile: '09123456789' })

    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toContain('sandbox.zarinpal.com/pg/v4/payment/request.json')
    expect(options?.method).toBe('POST')

    const body = JSON.parse(options?.body as string)
    expect(body.merchant_id).toBe('test-merchant-id')
    expect(body.amount).toBe(500000)
    expect(body.currency).toBe('IRT')
    expect(body.callback_url).toBe('http://localhost:3000/api/payment/verify')
    expect(body.metadata.mobile).toBe('09123456789')
  })

  it('returns success with sandbox redirect URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, authority: 'A001' } }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.authority).toBe('A001')
      expect(result.redirectUrl).toBe('https://sandbox.zarinpal.com/pg/StartPay/A001')
    }
  })

  it('returns success with live redirect URL when not sandbox', async () => {
    process.env.ZARINPAL_SANDBOX = 'false'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, authority: 'A002' } }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.redirectUrl).toBe('https://www.zarinpal.com/pg/StartPay/A002')
    }
  })

  it('accepts code 101 as success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 101, authority: 'A003' } }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(true)
  })

  it('returns error when API returns non-100/101 code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { code: -1, message: 'Invalid merchant' },
        errors: [{ message: 'Merchant not found' }],
      }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Merchant not found')
    }
  })

  it('falls back to data.message when errors array is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: -1, message: 'Something went wrong' } }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Something went wrong')
    }
  })

  it('falls back to default Persian error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: -1 } }),
    } as Response)

    const result = await initializePayment(500000, 'Test')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('پرداخت ناموفق بود')
    }
  })
})

describe('verifyPayment', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.ZARINPAL_MERCHANT_ID = 'test-merchant-id'
    process.env.ZARINPAL_SANDBOX = 'true'
  })

  it('sends correct verify request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, ref_id: 12345, card_pan: '1234' } }),
    } as Response)

    await verifyPayment('AUTH001', 500000)

    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toContain('sandbox.zarinpal.com/pg/v4/payment/verify.json')

    const body = JSON.parse(options?.body as string)
    expect(body.merchant_id).toBe('test-merchant-id')
    expect(body.amount).toBe(500000)
    expect(body.authority).toBe('AUTH001')
  })

  it('returns success with refId and cardPan', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, ref_id: 99999, card_pan: '6212-****' } }),
    } as Response)

    const result = await verifyPayment('AUTH001', 500000)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.refId).toBe(99999)
      expect(result.cardPan).toBe('6212-****')
    }
  })

  it('returns success with empty cardPan when not provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: 100, ref_id: 99999 } }),
    } as Response)

    const result = await verifyPayment('AUTH001', 500000)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.cardPan).toBe('')
    }
  })

  it('returns error on failed verification', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { code: -1, message: 'Verification failed' },
        errors: [{ message: 'Amount mismatch' }],
      }),
    } as Response)

    const result = await verifyPayment('AUTH001', 500000)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Amount mismatch')
      expect(result.code).toBe(-1)
    }
  })

  it('returns default code -1 when not provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response)

    const result = await verifyPayment('AUTH001', 500000)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe(-1)
    }
  })

  it('returns default Persian error when no message available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { code: -1 }, errors: [] }),
    } as Response)

    const result = await verifyPayment('AUTH001', 500000)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('تأیید پرداخت ناموفق بود')
    }
  })
})
