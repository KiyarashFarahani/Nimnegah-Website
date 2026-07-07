import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { COOKIE_NAME } from '@/lib/cookie'
import { blacklistToken } from '@/lib/redis'

const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, matches verify-otp cookie maxAge

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = tokenMatch?.[1]

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET!)
      const { payload: jwtPayload } = await jwtVerify(token, secret)
      const userId = jwtPayload.id as number
      const iat = jwtPayload.iat as number | undefined

      if (userId && iat) {
        const remainingTtl = TOKEN_MAX_AGE - (Math.floor(Date.now() / 1000) - iat)
        if (remainingTtl > 0) {
          await blacklistToken(`${userId}:${iat}`, remainingTtl)
        }
      }
    } catch {
      // Token already invalid, nothing to blacklist
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return response
}
