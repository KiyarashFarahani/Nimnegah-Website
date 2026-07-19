import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

import { createSpotPlayerLicense } from '../spotplayer'

describe('createSpotPlayerLicense', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.SPOTPLAYER_API_KEY = 'test-spotplayer-key'
  })

  it('sends correct request to SpotPlayer API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ _id: 'lic_123', key: 'KEY-ABC', url: 'https://spot.player/KEY-ABC' }),
    } as Response)

    await createSpotPlayerLicense('Ali', ['course1', 'course2'], '09123456789')

    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://panel.spotplayer.ir/license/edit/')
    expect(options?.method).toBe('POST')

    const headers = options?.headers as Record<string, string>
    expect(headers['$API']).toBe('test-spotplayer-key')
    expect(headers['$LEVEL']).toBe('-1')

    const body = JSON.parse(options?.body as string)
    expect(body.name).toBe('Ali')
    expect(body.course).toEqual(['course1', 'course2'])
    expect(body.watermark.texts[0].text).toBe('09123456789')
  })

  it('returns success with license details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        _id: 'lic_123',
        key: 'KEY-ABC',
        url: 'https://spot.player/KEY-ABC',
      }),
    } as Response)

    const result = await createSpotPlayerLicense('Ali', ['c1'], 'watermark')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.id).toBe('lic_123')
      expect(result.key).toBe('KEY-ABC')
      expect(result.url).toBe('https://spot.player/KEY-ABC')
    }
  })

  it('returns error when API response lacks _id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'bad request' }),
    } as Response)

    const result = await createSpotPlayerLicense('Ali', ['c1'], 'wm')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it('returns API error message when available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ex: { msg: 'Course not found' } }),
    } as Response)

    const result = await createSpotPlayerLicense('Ali', ['bad'], 'wm')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Course not found')
    }
  })

  it('returns default error message when no ex.msg', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const result = await createSpotPlayerLicense('Ali', ['c1'], 'wm')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('خطا در ایجاد لایسنس اسپات‌پلیر')
    }
  })
})
