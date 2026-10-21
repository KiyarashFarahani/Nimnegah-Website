import { getPayload } from 'payload'
import config from '@payload-config'
import redis from '@/lib/redis'
import type { DownloadTokenPayload } from '@/lib/download-token'

export type DownloadFileRecord = {
  filename: string
  filesize: number | null
  mimeType: string | null
}

const DEFAULT_AUTHZ_CACHE_SECONDS = 60

/**
 * How long a resolved authorization decision is cached.
 *
 * The download route used to run three database queries (purchase, file,
 * product) on every single request, before a byte was sent. With dozens of
 * concurrent downloads that saturates the 20-connection pool and takes the
 * rest of the site down with it. The cache keeps that off the database.
 *
 * The TTL is deliberately short so a refund or a revoked purchase takes
 * effect quickly rather than at the end of the link's 6-hour lifetime.
 */
export function getAuthzCacheSeconds(): number {
  const raw = Number(process.env.DOWNLOAD_AUTHZ_CACHE_SECONDS)
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_AUTHZ_CACHE_SECONDS
}

/**
 * Resolves whether the token holder may download the file, and returns the
 * file metadata needed to serve it.
 *
 * Returns `null` when the purchase is missing, the file is gone, or the file
 * does not belong to the purchased product.
 */
export async function resolveDownloadAuthorization(
  claims: DownloadTokenPayload,
): Promise<DownloadFileRecord | null> {
  const cacheTtl = getAuthzCacheSeconds()
  const cacheKey = `download:authz:${claims.jti}`

  if (cacheTtl > 0) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached) as DownloadFileRecord
      }
    } catch (err) {
      console.error('[Redis] Download authorization cache read failed:', err)
    }
  }

  const record = await resolveFromDatabase(claims)

  if (record && cacheTtl > 0) {
    try {
      await redis.set(cacheKey, JSON.stringify(record), 'EX', cacheTtl)
    } catch (err) {
      console.error('[Redis] Download authorization cache write failed:', err)
    }
  }

  return record
}

async function resolveFromDatabase(
  claims: DownloadTokenPayload,
): Promise<DownloadFileRecord | null> {
  const payload = await getPayload({ config })

  const purchases = await payload.find({
    collection: 'product-purchases',
    where: {
      and: [
        { user: { equals: claims.uid } },
        { product: { equals: claims.pid } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  if (purchases.docs.length === 0) {
    return null
  }

  const file = await payload.findByID({
    collection: 'product-files',
    id: claims.fid,
    depth: 0,
    overrideAccess: true,
  })

  if (!file || !file.filename) {
    return null
  }

  const product = await payload.findByID({
    collection: 'products',
    id: claims.pid,
    depth: 0,
    overrideAccess: true,
  })

  const fileIds = (product?.files ?? []).map((f) =>
    typeof f === 'object' && f !== null ? f.id : f,
  )
  if (!fileIds.includes(claims.fid)) {
    return null
  }

  return {
    filename: file.filename,
    filesize: file.filesize ?? null,
    mimeType: file.mimeType ?? null,
  }
}

/**
 * Drops the cached authorization decision for a token. Call after a refund or
 * a purchase change so the change takes effect immediately.
 */
export async function invalidateDownloadAuthorization(jti: string) {
  try {
    await redis.del(`download:authz:${jti}`)
  } catch (err) {
    console.error('[Redis] Download authorization cache invalidation failed:', err)
  }
}
