import { NextResponse } from 'next/server'
import fs from 'fs'
import { access, stat } from 'fs/promises'
import path from 'path'
import { verifyDownloadToken } from '@/lib/download-token'
import { resolveDownloadAuthorization } from '@/lib/download-access'
import {
  checkDownloadTokenRateLimit,
  isDownloadTokenRevoked,
} from '@/lib/redis'
import {
  formatContentRange,
  nodeStreamToWeb,
  parseRangeHeader,
} from '@/lib/file-stream'

const PROTECTED_DIR = path.resolve(process.cwd(), 'protected/products')

/**
 * Whether Nginx can serve the file bytes for us.
 *
 * Nginx advertises support with the `X-Accel-Supported` request header on the
 * download location. When it is present we hand the file over with
 * `X-Accel-Redirect` and Nginx streams it straight from disk — Node never
 * touches a single byte of the payload, so download traffic cannot saturate
 * the app server's event loop.
 *
 * If Nginx is not in front (or is running an older config) we fall back to
 * streaming through Node, which is still correct — just less efficient.
 */
function isXAccelEnabled(request: Request): boolean {
  if (process.env.DOWNLOAD_X_ACCEL_ENABLED !== 'true') return false
  return request.headers.get('x-accel-supported') === '1'
}

function getAccelPath(): string {
  const raw = process.env.DOWNLOAD_X_ACCEL_PATH || '/protected-files/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const claims = await verifyDownloadToken(token)
    if (!claims) {
      return NextResponse.json({ error: 'Link is invalid or expired' }, { status: 401 })
    }

    if (await isDownloadTokenRevoked(claims.jti)) {
      return NextResponse.json({ error: 'Link has been revoked' }, { status: 403 })
    }

    const rateCheck = await checkDownloadTokenRateLimit(claims.jti)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests for this link. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter ?? 300) } },
      )
    }

    const file = await resolveDownloadAuthorization(claims)
    if (!file) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 403 })
    }

    const filePath = path.join(PROTECTED_DIR, file.filename)
    const resolved = path.resolve(filePath)
    const relativePath = path.relative(PROTECTED_DIR, resolved)
    if (
      relativePath === '..' ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath)
    ) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    try {
      await access(resolved)
    } catch {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const fileStat = await stat(resolved)
    const contentType = file.mimeType || 'application/octet-stream'
    const filename = file.filename

    const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '_')
    const contentDisposition =
      `attachment; filename="${asciiFilename.replace(/"/g, '')}"; ` +
      `filename*=UTF-8''${encodeURIComponent(filename)}`

    const baseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    }

    // Nginx serves the bytes from disk. No Content-Length here on purpose:
    // Nginx computes it (and handles Range requests) for the internal
    // redirect, and a stale length would corrupt partial responses.
    if (isXAccelEnabled(request)) {
      return new Response(null, {
        status: 200,
        headers: {
          ...baseHeaders,
          'X-Accel-Redirect': `${getAccelPath()}${encodeURIComponent(filename)}`,
        },
      })
    }

    const range = parseRangeHeader(request.headers.get('range'), fileStat.size)

    if (range === 'unsatisfiable') {
      return new Response(null, {
        status: 416,
        headers: {
          ...baseHeaders,
          'Content-Range': `bytes */${fileStat.size}`,
          'Accept-Ranges': 'bytes',
        },
      })
    }

    if (range) {
      const stream = fs.createReadStream(resolved, {
        start: range.start,
        end: range.end,
      })

      return new Response(nodeStreamToWeb(stream), {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Length': String(range.end - range.start + 1),
          'Content-Range': formatContentRange(range, fileStat.size),
          'Accept-Ranges': 'bytes',
        },
      })
    }

    const stream = fs.createReadStream(resolved)

    return new Response(nodeStreamToWeb(stream), {
      status: 200,
      headers: {
        ...baseHeaders,
        'Content-Length': String(fileStat.size),
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
