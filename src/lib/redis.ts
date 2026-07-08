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

export async function getOTP(phone: string): Promise<string | null> {
  try {
    return await redis.get(`otp:${phone}`)
  } catch (err) {
    console.error('[Redis] getOTP failed:', err)
    throw new Error('Failed to retrieve OTP')
  }
}

export async function deleteOTP(phone: string) {
  try {
    await redis.del(`otp:${phone}`)
  } catch (err) {
    console.error('[Redis] deleteOTP failed:', err)
    throw new Error('Failed to delete OTP')
  }
}

// --- OTP Resend Cooldown ---

const OTP_RESEND_COOLDOWN = 60 // seconds

export async function checkResendCooldown(
  phone: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const ttl = await redis.ttl(`cooldown:otp:${phone}`)
    if (ttl > 0) {
      return { allowed: false, retryAfter: ttl }
    }
    return { allowed: true }
  } catch (err) {
    console.error('[Redis] checkResendCooldown failed:', err)
    return { allowed: true }
  }
}

export async function setResendCooldown(phone: string) {
  try {
    await redis.setex(`cooldown:otp:${phone}`, OTP_RESEND_COOLDOWN, '1')
  } catch (err) {
    console.error('[Redis] setResendCooldown failed:', err)
  }
}

// --- Rate limiting ---

const OTP_SEND_LIMIT = 3
const OTP_SEND_WINDOW = 300 // 5 minutes
const OTP_VERIFY_LIMIT = 5
const OTP_VERIFY_WINDOW = 300 // 5 minutes
const OTP_LOCKOUT_DURATION = 900 // 15 minutes

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

    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, window)
    }

    if (current > limit) {
      // Check if this is the third failed verify attempt
      if (type === 'verify') {
        const verifyFailsKey = `verify_fails:${phone}`
        const fails = await redis.incr(verifyFailsKey)
        if (fails === 1) {
          await redis.expire(verifyFailsKey, OTP_LOCKOUT_DURATION)
        }
        if (fails >= OTP_VERIFY_LIMIT) {
          await redis.setex(lockKey, OTP_LOCKOUT_DURATION, '1')
          const ttl = await redis.ttl(lockKey)
          return { allowed: false, retryAfter: ttl }
        }
      }
      const ttl = await redis.ttl(key)
      return { allowed: false, retryAfter: ttl > 0 ? ttl : window }
    }

    return { allowed: true }
  } catch (err) {
    console.error('[Redis] Rate limit check failed:', err)
    // Fail open — allow the request if Redis is down
    return { allowed: true }
  }
}

export async function resetVerifyFailures(phone: string) {
  try {
    await redis.del(`verify_fails:${phone}`)
  } catch (err) {
    console.error('[Redis] resetVerifyFailures failed:', err)
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
