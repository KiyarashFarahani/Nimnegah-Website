import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'

type FileDoc = { id: number; filename?: string | null; filesize?: number | null; mimeType?: string | null }

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { slug } = await params
    const payload = await getPayload({ config })

    const products = await payload.find({
      collection: 'products',
      depth: 1,
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    const product = products.docs[0]
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const purchases = await payload.find({
      collection: 'product-purchases',
      where: {
        and: [
          { user: { equals: auth.user.id } },
          { product: { equals: product.id } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (purchases.docs.length === 0) {
      return NextResponse.json({ error: 'Not purchased' }, { status: 403 })
    }

    const rawFiles = Array.isArray(product.files) ? (product.files as FileDoc[]) : []
    const files = rawFiles
      .filter((f): f is FileDoc & { filename: string } => !!f && typeof f.filename === 'string')
      .map((f) => ({
        id: f.id,
        filename: f.filename,
        filesize: f.filesize ?? null,
        mimeType: f.mimeType ?? null,
      }))

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description ?? null,
        thumbnail: product.thumbnail ?? null,
        files,
      },
      purchase: purchases.docs[0],
    })
  } catch (error) {
    console.error('Dashboard product fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
