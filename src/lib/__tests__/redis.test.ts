import { describe, it, expect, vi } from 'vitest'

vi.mock('ioredis', () => {
  const store = new Map<string, string>()
  const ttls = new Map<string, number>()
  return {
    default: class MockRedis {
      async set(key: string, value: string, ...args: Array<number | string>) {
        if (args.includes('NX') && store.has(key)) return null
        store.set(key, value)
        const exIndex = args.indexOf('EX')
        if (exIndex !== -1) ttls.set(key, Number(args[exIndex + 1]))
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
      async eval(script: string, _numberOfKeys: number, key: string, value: string | number) {
        if (script.includes("'INCR'")) {
          const current = parseInt(store.get(key) ?? '0', 10) + 1
          store.set(key, String(current))
          if (current === 1) ttls.set(key, Number(value))
          return [current, ttls.get(key) ?? -1]
        }
        if (store.get(key) === String(value)) {
          store.delete(key)
          ttls.delete(key)
          return 1
        }
        return 0
      }
      async ping() {
        return 'PONG'
      }
      on() { return this }
    },
  }
})

import { setOTP, consumeOTP, checkRateLimit, claimResendCooldown, releaseResendCooldown, blacklistToken, isTokenBlacklisted, resetVerifyFailures, checkDiscountRateLimit } from '../redis'

describe('OTP operations', () => {
  it('consumes a matching OTP only once', async () => {
    await setOTP('09123456789', '123456')
    expect(await consumeOTP('09123456789', '123456')).toBe(true)
    expect(await consumeOTP('09123456789', '123456')).toBe(false)
  })

  it('does not consume a mismatched OTP', async () => {
    await setOTP('09111111111', '654321')
    expect(await consumeOTP('09111111111', '123456')).toBe(false)
    expect(await consumeOTP('09111111111', '654321')).toBe(true)
  })
})

describe('resend cooldown', () => {
  it('allows one claimant and only its token can release the cooldown', async () => {
    const phone = '09123456787'
    expect((await claimResendCooldown(phone, 'owner')).allowed).toBe(true)
    expect((await claimResendCooldown(phone, 'other')).allowed).toBe(false)
    await releaseResendCooldown(phone, 'other')
    expect((await claimResendCooldown(phone, 'third')).allowed).toBe(false)
    await releaseResendCooldown(phone, 'owner')
    expect((await claimResendCooldown(phone, 'third')).allowed).toBe(true)
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

describe('checkDiscountRateLimit', () => {
  it('allows requests under the limit', async () => {
    for (let i = 0; i < 20; i++) {
      const result = await checkDiscountRateLimit('127.0.0.1')
      expect(result.allowed).toBe(true)
    }
  })

  it('blocks once the limit is exceeded', async () => {
    const identifier = '10.0.0.1'
    for (let i = 0; i < 20; i++) {
      await checkDiscountRateLimit(identifier)
    }
    const result = await checkDiscountRateLimit(identifier)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('tracks identifiers separately', async () => {
    await checkDiscountRateLimit('a')
    const result = await checkDiscountRateLimit('b')
    expect(result.allowed).toBe(true)
  })
})
