import { describe, it, expect, vi } from 'vitest'

vi.mock('ioredis', () => {
  const store = new Map<string, string>()
  const ttls = new Map<string, number>()
  return {
    default: class MockRedis {
      async set(key: string, value: string, _flag?: string, ttl?: number) {
        store.set(key, value)
        if (ttl) ttls.set(key, ttl)
        return 'OK'
      }
      async get(key: string) {
        return store.get(key) ?? null
      }
      async del(key: string) {
        store.delete(key)
        ttls.delete(key)
        return 1
      }
      async setex(key: string, ttl: number, value: string) {
        store.set(key, value)
        ttls.set(key, ttl)
        return 'OK'
      }
      async ttl(key: string) {
        return ttls.get(key) ?? -2
      }
      async incr(key: string) {
        const current = parseInt(store.get(key) ?? '0', 10) + 1
        store.set(key, String(current))
        return current
      }
      async expire(_key: string, _ttl: number) {
        return 1
      }
      async ping() {
        return 'PONG'
      }
      on() { return this }
    },
  }
})

import { setOTP, getOTP, deleteOTP, checkRateLimit, checkResendCooldown, setResendCooldown, blacklistToken, isTokenBlacklisted, resetVerifyFailures } from '../redis'

describe('OTP operations', () => {
  it('stores and retrieves an OTP', async () => {
    await setOTP('09123456789', '123456')
    const code = await getOTP('09123456789')
    expect(code).toBe('123456')
  })

  it('returns null for non-existent OTP', async () => {
    const code = await getOTP('09999999999')
    expect(code).toBeNull()
  })

  it('deletes an OTP', async () => {
    await setOTP('09111111111', '654321')
    await deleteOTP('09111111111')
    const code = await getOTP('09111111111')
    expect(code).toBeNull()
  })
})

describe('checkResendCooldown', () => {
  it('allows resend when no cooldown active', async () => {
    const result = await checkResendCooldown('09123456788')
    expect(result.allowed).toBe(true)
  })

  it('blocks resend during cooldown', async () => {
    await setResendCooldown('09123456787')
    const result = await checkResendCooldown('09123456787')
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })
})

describe('checkRateLimit', () => {
  it('allows first request', async () => {
    const result = await checkRateLimit('09123456780', 'send')
    expect(result.allowed).toBe(true)
  })

  it('blocks after exceeding send limit (3)', async () => {
    const phone = '09123456781'
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(phone, 'send')
    }
    const result = await checkRateLimit(phone, 'send')
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('blocks after exceeding verify limit (5)', async () => {
    const phone = '09123456782'
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(phone, 'verify')
    }
    const result = await checkRateLimit(phone, 'verify')
    expect(result.allowed).toBe(false)
  })
})

describe('token blacklist', () => {
  it('blacklists a token and detects it', async () => {
    await blacklistToken('1:1000', 3600)
    const result = await isTokenBlacklisted('1:1000')
    expect(result).toBe(true)
  })

  it('returns false for non-blacklisted token', async () => {
    const result = await isTokenBlacklisted('999:9999')
    expect(result).toBe(false)
  })
})

describe('resetVerifyFailures', () => {
  it('runs without error', async () => {
    await expect(resetVerifyFailures('09123456789')).resolves.toBeUndefined()
  })
})
