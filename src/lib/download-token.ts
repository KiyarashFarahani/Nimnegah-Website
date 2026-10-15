import { SignJWT, jwtVerify } from 'jose'
import { randomUUID } from 'crypto'

export type DownloadTokenPayload = {
  uid: number
  pid: number
  fid: number
}

const DEFAULT_TTL_MINUTES = 360 // 6 hours

export function getDownloadLinkTtlMinutes(): number {
  const raw = Number(process.env.DOWNLOAD_LINK_TTL_MINUTES)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_MINUTES
}

function getSecret(): Uint8Array {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET || process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('DOWNLOAD_TOKEN_SECRET or PAYLOAD_SECRET must be set')
  }
  return new TextEncoder().encode(secret)
}

export async function createDownloadToken(
  payload: DownloadTokenPayload,
  ttlMinutes: number = getDownloadLinkTtlMinutes(),
): Promise<{ token: string; expiresAt: string }> {
  const expSeconds = Math.floor(Date.now() / 1000) + ttlMinutes * 60

  const token = await new SignJWT({
    uid: payload.uid,
    pid: payload.pid,
    fid: payload.fid,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(expSeconds)
    .sign(getSecret())

  return {
    token,
    expiresAt: new Date(expSeconds * 1000).toISOString(),
  }
}

export async function verifyDownloadToken(
  token: string,
): Promise<DownloadTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    })

    const uid = Number(payload.uid)
    const pid = Number(payload.pid)
    const fid = Number(payload.fid)

    if (!Number.isInteger(uid) || !Number.isInteger(pid) || !Number.isInteger(fid)) {
      return null
    }
    if (uid <= 0 || pid <= 0 || fid <= 0) {
      return null
    }

    return { uid, pid, fid }
  } catch {
    return null
  }
}
