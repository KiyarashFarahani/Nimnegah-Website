import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL!
const redisPassword = process.env.REDIS_PASSWORD

const redis = new Redis(redisUrl, {
  password: redisPassword || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null
    return Math.min(times * 200, 2000)
  },
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message)
})

export default redis

// --- OTP operations ---

export async function setOTP(phone: string, code: string, ttlSeconds = 300) {
  try {
    await redis.set(`otp:${phone}`, code, 'EX', ttlSeconds)
  } catch (err) {
    console.error('[Redis] setOTP failed:', err)
    throw new Error('Failed to store OTP')
  }
}

export async function consumeOTP(phone: string, code: string): Promise<boolean> {
  try {
    const result = await redis.eval(
      `if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0`,
      1,
      `otp:${phone}`,
      code,
    )
    return result === 1
  } catch (err) {
    console.error('[Redis] consumeOTP failed:', err)
    throw new Error('Failed to consume OTP')
  }
}

// --- OTP Resend Cooldown ---

const OTP_RESEND_COOLDOWN = 60 // seconds

export async function claimResendCooldown(
  phone: string,
  token: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const key = `cooldown:otp:${phone}`
    const claimed = await redis.set(key, token, 'EX', OTP_RESEND_COOLDOWN, 'NX')
    if (claimed === 'OK') return { allowed: true }
    const ttl = await redis.ttl(key)
    return { allowed: false, retryAfter: ttl > 0 ? ttl : OTP_RESEND_COOLDOWN }
  } catch (err) {
    console.error('[Redis] claimResendCooldown failed:', err)
    return { allowed: false, retryAfter: OTP_RESEND_COOLDOWN }
  }
}

export async function releaseResendCooldown(phone: string, token: string) {
  try {
    await redis.eval(
      `if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0`,
      1,
      `cooldown:otp:${phone}`,
      token,
    )
  } catch (err) {
    console.error('[Redis] releaseResendCooldown failed:', err)
  }
}

// --- Rate limiting ---

const OTP_SEND_LIMIT = 3
const OTP_SEND_WINDOW = 300 // 5 minutes
const OTP_VERIFY_LIMIT = 5
const OTP_VERIFY_WINDOW = 300 // 5 minutes
const OTP_LOCKOUT_DURATION = 900 // 15 minutes

async function incrementWithExpiry(key: string, ttlSeconds: number) {
  return await redis.eval(
    `local current = redis.call('INCR', KEYS[1])
    if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
    return {current, redis.call('TTL', KEYS[1])}`,
    1,
    key,
    ttlSeconds,
  ) as [number, number]
}

export async function checkRateLimit(
  phone: string,
  type: 'send' | 'verify',
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `ratelimit:${type}:${phone}`
  const limit = type === 'send' ? OTP_SEND_LIMIT : OTP_VERIFY_LIMIT
  const window = type === 'send' ? OTP_SEND_WINDOW : OTP_VERIFY_WINDOW

  try {
    const lockKey = `lockout:${phone}`
    const isLockedOut = await redis.get(lockKey)
    if (isLockedOut) {
      const ttl = await redis.ttl(lockKey)
      return { allowed: false, retryAfter: ttl > 0 ? ttl : OTP_LOCKOUT_DURATION }
    }

    const [current, counterTTL] = await incrementWithExpiry(key, window)

    if (current > limit) {
      // Check if this is the third failed verify attempt
      if (type === 'verify') {
        const verifyFailsKey = `verify_fails:${phone}`
        const [fails] = await incrementWithExpiry(verifyFailsKey, OTP_LOCKOUT_DURATION)
        if (fails >= OTP_VERIFY_LIMIT) {
          await redis.setex(lockKey, OTP_LOCKOUT_DURATION, '1')
          const ttl = await redis.ttl(lockKey)
          return { allowed: false, retryAfter: ttl }
        }
      }
      return { allowed: false, retryAfter: counterTTL > 0 ? counterTTL : window }
    }

    return { allowed: true }
  } catch (err) {
    console.error('[Redis] Rate limit check failed:', err)
    return { allowed: false, retryAfter: window }
  }
}

export async function resetVerifyFailures(phone: string) {
  try {
    await redis.del(`verify_fails:${phone}`)
  } catch (err) {
    console.error('[Redis] resetVerifyFailures failed:', err)
  }
}

// --- Discount code validation rate limiting ---

const DISCOUNT_CHECK_LIMIT = 20
const DISCOUNT_CHECK_WINDOW = 300 // 5 minutes

export async function checkDiscountRateLimit(
  identifier: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `ratelimit:discount:${identifier}`

  try {
    const [current, counterTTL] = await incrementWithExpiry(key, DISCOUNT_CHECK_WINDOW)

    if (current > DISCOUNT_CHECK_LIMIT) {
      return {
        allowed: false,
        retryAfter: counterTTL > 0 ? counterTTL : DISCOUNT_CHECK_WINDOW,
      }
    }

    return { allowed: true }
  } catch (err) {
    console.error('[Redis] Discount rate limit check failed:', err)
    return { allowed: true }
  }
}

// --- Session blacklist ---

export async function blacklistToken(jti: string, ttlSeconds: number) {
  try {
    await redis.setex(`blacklist:${jti}`, ttlSeconds, '1')
  } catch (err) {
    console.error('[Redis] blacklistToken failed:', err)
  }
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const result = await redis.get(`blacklist:${jti}`)
    return result === '1'
  } catch (err) {
    console.error('[Redis] isTokenBlacklisted failed:', err)
    return false
  }
}
