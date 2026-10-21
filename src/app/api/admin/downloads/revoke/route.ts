import { NextResponse } from 'next/server'
import { revokeDownloadToken } from '@/lib/redis'
import { verifyDownloadToken } from '@/lib/download-token'
import { authenticateRequest } from '@/lib/auth'

/**
 * Revokes a download link before it expires on its own.
 *
 * A download token is the only credential for a download, so a link that
 * leaked (shared, posted, leaked in a screenshot) stays usable until its TTL
 * runs out. Revoking it here stops it immediately.
 *
 * POST /api/admin/downloads/revoke
 * Body: { "token": "<the signed download token>" }
 */
export async function POST(request: Request) {
  const auth = await authenticateRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  if (auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.token || typeof body.token !== 'string') {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const claims = await verifyDownloadToken(body.token)
  if (!claims) {
    return NextResponse.json(
      { error: 'Token is invalid or already expired' },
      { status: 400 },
    )
  }

  const remainingSeconds = Math.max(0, claims.exp - Math.floor(Date.now() / 1000))
  if (remainingSeconds === 0) {
    return NextResponse.json(
      { error: 'Token is invalid or already expired' },
      { status: 400 },
    )
  }

  await revokeDownloadToken(claims.jti, remainingSeconds)

  return NextResponse.json({
    revoked: true,
    jti: claims.jti,
    expiresAt: new Date(claims.exp * 1000).toISOString(),
  })
}
