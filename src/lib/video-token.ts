import { createHmac, timingSafeEqual } from 'crypto'
import path from 'path'

const VIDEO_URL_TTL_SECONDS = 2 * 60 * 60

function sign(filename: string, expires: number, secret: string) {
  return createHmac('sha256', secret)
    .update(`${filename}:${expires}`)
    .digest('base64url')
}

export function createVideoToken(filename: string, secret: string, now = Date.now()) {
  const expires = Math.floor(now / 1000) + VIDEO_URL_TTL_SECONDS
  return { filename, expires, signature: sign(filename, expires, secret) }
}

export function verifyVideoToken(
  filename: string,
  expires: number,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  if (!filename || path.basename(filename) !== filename) return false
  if (!Number.isInteger(expires) || expires < Math.floor(now / 1000)) return false
  const expected = Buffer.from(sign(filename, expires, secret))
  const actual = Buffer.from(signature)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
