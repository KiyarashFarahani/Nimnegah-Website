import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

import { generateOTP, sendOTP } from '../smsir'

describe('generateOTP', () => {
  it('returns a 6-digit string', () => {
    const code = generateOTP()
    expect(code).toMatch(/^\d{6}$/)
  })

  it('returns different values on successive calls', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateOTP()))
    expect(codes.size).toBeGreaterThan(1)
  })

  it('returns a value between 100000 and 999999', () => {
    for (let i = 0; i < 50; i++) {
      const code = Number(generateOTP())
      expect(code).toBeGreaterThanOrEqual(100000)
      expect(code).toBeLessThan(1000000)
    }
  })
})

describe('sendOTP', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.SMSIR_API_KEY = 'test-api-key'
    process.env.SMSIR_TEMPLATE_ID = '12345'
  })

  it('sends correct request body to sms.ir', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 1 }),
    } as Response)

    await sendOTP('09123456789', '654321')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.sms.ir/v1/send/verify')
    expect(options?.method).toBe('POST')

    const body = JSON.parse(options?.body as string)
    expect(body.mobile).toBe('09123456789')
    expect(body.templateId).toBe(12345)
    expect(body.parameters).toEqual([{ name: 'CODE', value: '654321' }])
  })

  it('includes api key header', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 1 }),
    } as Response)

    await sendOTP('09123456789', '123456')

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['x-api-key']).toBe('test-api-key')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('throws when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response)

    await expect(sendOTP('09123456789', '123456')).rejects.toThrow('SMS send failed')
  })
})
