import { describe, expect, it } from 'vitest'
import { createVideoToken, verifyVideoToken } from '../video-token'

describe('video tokens', () => {
  const secret = 'test-secret'
  const now = 1_700_000_000_000

  it('accepts an untampered token before expiration', () => {
    const token = createVideoToken('lesson.mp4', secret, now)
    expect(verifyVideoToken(
      token.filename,
      token.expires,
      token.signature,
      secret,
      now,
    )).toBe(true)
  })

  it('rejects expired, tampered, and nested paths', () => {
    const token = createVideoToken('lesson.mp4', secret, now)
    expect(verifyVideoToken(token.filename, token.expires, token.signature, secret, now + 7_201_000)).toBe(false)
    expect(verifyVideoToken('other.mp4', token.expires, token.signature, secret, now)).toBe(false)
    expect(verifyVideoToken('../lesson.mp4', token.expires, token.signature, secret, now)).toBe(false)
  })
})
