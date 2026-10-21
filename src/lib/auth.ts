import { jwtVerify } from 'jose'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'
import { COOKIE_NAME } from '@/lib/cookie'
import { isTokenBlacklisted } from '@/lib/redis'

type AuthResult =
  | { success: true; user: User }
  | { success: false; status: number; error: string }

function getCookieToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return tokenMatch?.[1] ?? null
}

/**
 * Verifies a session cookie against both secrets the app uses.
 *
 * Two different secrets sign sessions in this app:
 *
 * - The app's own login (`/api/auth/verify-otp`) signs with the raw
 *   `PAYLOAD_SECRET`.
 * - The Payload admin panel signs with `payload.secret`, which Payload
 *   derives as `sha256(PAYLOAD_SECRET)` truncated to 32 chars.
 *
 * An admin can be logged in through either door, so both cookies have to be
 * accepted — verifying against only one of them locks the other out.
 */
async function verifySessionToken(
  token: string,
): Promise<{ id: number; iat?: number } | null> {
  const payload = await getPayload({ config })

  const secrets = [
    new TextEncoder().encode(process.env.PAYLOAD_SECRET!),
    new TextEncoder().encode(payload.secret),
  ]

  for (const secret of secrets) {
    try {
      const { payload: claims } = await jwtVerify(token, secret)
      const id = Number(claims.id)
      if (Number.isInteger(id) && id > 0) {
        return { id, iat: claims.iat as number | undefined }
      }
    } catch {
      // Not signed with this secret — try the next one.
    }
  }

  return null
}

export async function authenticateRequest(
  request: Request,
): Promise<AuthResult> {
  const token = getCookieToken(request)

  if (!token) {
    return { success: false, status: 401, error: 'Unauthorized' }
  }

  try {
    const claims = await verifySessionToken(token)

    if (!claims) {
      return { success: false, status: 401, error: 'Unauthorized' }
    }

    const { id: userId, iat } = claims

    if (userId && iat) {
      const blacklisted = await isTokenBlacklisted(`${userId}:${iat}`)
      if (blacklisted) {
        return { success: false, status: 401, error: 'Unauthorized' }
      }
    }

    const payload = await getPayload({ config })
    const user = await payload.findByID({ collection: 'users', id: userId })

    if (!user) {
      return { success: false, status: 401, error: 'Unauthorized' }
    }

    return { success: true, user }
  } catch {
    return { success: false, status: 401, error: 'Unauthorized' }
  }
}

/**
 * Same as `authenticateRequest`, but the caller must be an admin.
 */
export async function authenticateAdmin(
  request: Request,
): Promise<AuthResult> {
  const auth = await authenticateRequest(request)

  if (!auth.success) {
    return auth
  }

  if (auth.user.role !== 'admin') {
    return { success: false, status: 403, error: 'Forbidden' }
  }

  return auth
}
