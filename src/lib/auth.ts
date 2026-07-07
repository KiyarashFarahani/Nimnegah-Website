import { jwtVerify } from 'jose'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'
import { COOKIE_NAME } from '@/lib/cookie'
import { isTokenBlacklisted } from '@/lib/redis'

type AuthResult =
  | { success: true; user: User }
  | { success: false; status: number; error: string }

export async function authenticateRequest(
  request: Request,
): Promise<AuthResult> {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = tokenMatch?.[1]

  if (!token) {
    return { success: false, status: 401, error: 'Unauthorized' }
  }

  try {
    const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET!)
    const { payload: jwtPayload } = await jwtVerify(token, secret)
    const userId = jwtPayload.id as number
    const iat = jwtPayload.iat as number | undefined

    if (!userId) {
      return { success: false, status: 401, error: 'Unauthorized' }
    }

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
