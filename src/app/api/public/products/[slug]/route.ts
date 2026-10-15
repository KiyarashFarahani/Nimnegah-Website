import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { COOKIE_NAME } from '@/lib/cookie'

type FileDoc = { id: number; filename?: string | null; filesize?: number | null; mimeType?: string | null }

function sanitizeProductFiles(files: FileDoc[] | null | undefined) {
  if (!files) return []
  return files
    .filter((f): f is FileDoc & { filename: string } => !!f && typeof f.filename === 'string')
    .map((f) => ({
      id: f.id,
      filename: f.filename,
      filesize: f.filesize ?? null,
      mimeType: f.mimeType ?? null,
    }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    const products = await payload.find({
      collection: 'products',
      depth: 1,
      where: {
        slug: { equals: slug },
        status: { in: ['published', 'coming_soon'] },
      },
      limit: 1,
      overrideAccess: true,
    })

    const product = products.docs[0]
    if (!product) {
      return NextResponse.json({ product: null }, { status: 404 })
    }

    let isPurchased = false

    try {
      const cookieStore = await cookies()
      const token = cookieStore.get(COOKIE_NAME)?.value
      if (token) {
        const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET!)
        const { payload: jwtPayload } = await jwtVerify(token, secret)
        const userId = Number(jwtPayload.id)

        if (userId) {
          const purchase = await payload.find({
            collection: 'product-purchases',
            where: {
              and: [
                { user: { equals: userId } },
                { product: { equals: product.id } },
              ],
            },
            limit: 1,
          })
          isPurchased = purchase.docs.length > 0
        }
      }
    } catch {
      // Not authenticated, that's fine
    }

    const files = Array.isArray(product.files)
      ? sanitizeProductFiles(product.files as FileDoc[])
      : []

    return NextResponse.json({
      product: { ...product, files },
      isPurchased,
    })
  } catch (error) {
    console.error('Product detail error:', error)
    return NextResponse.json({ product: null }, { status: 500 })
  }
}
