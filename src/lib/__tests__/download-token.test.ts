import { describe, it, expect, beforeAll } from 'vitest'
import {
  createDownloadToken,
  verifyDownloadToken,
  getDownloadLinkTtlMinutes,
} from '../download-token'

beforeAll(() => {
  process.env.DOWNLOAD_TOKEN_SECRET = 'test-download-secret-32-chars-min!!'
})

describe('createDownloadToken / verifyDownloadToken', () => {
  it('round-trips valid claims', async () => {
    const { token, expiresAt } = await createDownloadToken({
      uid: 42,
      pid: 7,
      fid: 99,
    })

    expect(typeof token).toBe('string')
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now())

    const claims = await verifyDownloadToken(token)
    expect(claims).toMatchObject({ uid: 42, pid: 7, fid: 99 })
    expect(typeof claims?.jti).toBe('string')
    expect(claims?.jti.length).toBeGreaterThan(0)
    expect(claims?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('gives every link a distinct jti', async () => {
    const a = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })
    const b = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })

    const claimsA = await verifyDownloadToken(a.token)
    const claimsB = await verifyDownloadToken(b.token)

    expect(claimsA?.jti).not.toBe(claimsB?.jti)
  })

  it('embeds the requested TTL', async () => {
    const { expiresAt } = await createDownloadToken(
      { uid: 1, pid: 1, fid: 1 },
      60,
    )
    const deltaSeconds = (new Date(expiresAt).getTime() - Date.now()) / 1000
    expect(deltaSeconds).toBeGreaterThan(3595)
    expect(deltaSeconds).toBeLessThanOrEqual(3601)
  })

  it('produces a different token on each generation (unique per person/click)', async () => {
    const a = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })
    const b = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })
    expect(a.token).not.toBe(b.token)
  })

  it('rejects an expired token', async () => {
    const { token } = await createDownloadToken(
      { uid: 1, pid: 1, fid: 1 },
      -1,
    )
    const claims = await verifyDownloadToken(token)
    expect(claims).toBeNull()
  })

  it('rejects a tampered token', async () => {
    const { token } = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })
    const tampered = token.slice(0, -3) + 'abc'
    const claims = await verifyDownloadToken(tampered)
    expect(claims).toBeNull()
  })

  it('rejects garbage input', async () => {
    expect(await verifyDownloadToken('not-a-token')).toBeNull()
    expect(await verifyDownloadToken('')).toBeNull()
  })

  it('rejects a token signed with a different secret', async () => {
    const original = process.env.DOWNLOAD_TOKEN_SECRET
    process.env.DOWNLOAD_TOKEN_SECRET = 'another-secret-entirely-32chars!'
    const { token } = await createDownloadToken({ uid: 1, pid: 1, fid: 1 })
    process.env.DOWNLOAD_TOKEN_SECRET = original

    const claims = await verifyDownloadToken(token)
    expect(claims).toBeNull()
  })

  it('rejects tokens with invalid claim types', async () => {
    const { SignJWT } = await import('jose')
    const secret = new TextEncoder().encode(
      'test-download-secret-32-chars-min!!',
    )
    const token = await new SignJWT({ uid: 'x', pid: null, fid: undefined })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 300)
      .sign(secret)

    const claims = await verifyDownloadToken(token)
    expect(claims).toBeNull()
  })
})

describe('getDownloadLinkTtlMinutes', () => {
  it('defaults to 360 (6 hours) when unset', () => {
    const original = process.env.DOWNLOAD_LINK_TTL_MINUTES
    delete process.env.DOWNLOAD_LINK_TTL_MINUTES
    expect(getDownloadLinkTtlMinutes()).toBe(360)
    if (original !== undefined) process.env.DOWNLOAD_LINK_TTL_MINUTES = original
  })

  it('reads the env override', () => {
    process.env.DOWNLOAD_LINK_TTL_MINUTES = '30'
    expect(getDownloadLinkTtlMinutes()).toBe(30)
    delete process.env.DOWNLOAD_LINK_TTL_MINUTES
  })

  it('falls back to default for invalid values', () => {
    process.env.DOWNLOAD_LINK_TTL_MINUTES = 'not-a-number'
    expect(getDownloadLinkTtlMinutes()).toBe(360)
    delete process.env.DOWNLOAD_LINK_TTL_MINUTES
  })
})
