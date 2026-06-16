import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export default redis

export async function setOTP(phone: string, code: string, ttlSeconds = 300) {
  await redis.set(`otp:${phone}`, code, 'EX', ttlSeconds)
}

export async function getOTP(phone: string) {
  return redis.get(`otp:${phone}`)
}

export async function deleteOTP(phone: string) {
  await redis.del(`otp:${phone}`)
}
