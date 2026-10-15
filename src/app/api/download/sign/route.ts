import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import { createDownloadToken } from '@/lib/download-token'
import { checkDownloadSignRateLimit } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const rateCheck = await checkDownloadSignRateLimit(auth.user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' },
        { status: 429 },
      )
    }

    const { productId, fileId } = await request.json()

    if (typeof productId !== 'number' || typeof fileId !== 'number') {
      return NextResponse.json({ error: 'Invalid productId or fileId' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const purchases = await payload.find({
      collection: 'product-purchases',
      where: {
        and: [
          { user: { equals: auth.user.id } },
          { product: { equals: productId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (purchases.docs.length === 0) {
      return NextResponse.json({ error: 'Not purchased' }, { status: 403 })
    }

    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 1,
      overrideAccess: true,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const fileIds = (product.files ?? []).map((f) =>
      typeof f === 'object' && f !== null ? f.id : f,
    )

    if (!fileIds.includes(fileId)) {
      return NextResponse.json({ error: 'File does not belong to this product' }, { status: 404 })
    }

    const { token, expiresAt } = await createDownloadToken({
      uid: auth.user.id,
      pid: productId,
      fid: fileId,
    })

    return NextResponse.json({
      url: `/api/download/${token}`,
      expiresAt,
    })
  } catch (error) {
    console.error('Download sign error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
