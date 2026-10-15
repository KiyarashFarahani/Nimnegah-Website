import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })

    const purchases = await payload.find({
      collection: 'product-purchases',
      depth: 2,
      where: {
        user: { equals: auth.user.id },
      },
      sort: '-purchasedAt',
      overrideAccess: true,
    })

    // Guard against deleted products
    const sanitized = purchases.docs.filter(
      (purchase) => purchase.product && typeof purchase.product === 'object',
    )

    return NextResponse.json({ purchases: sanitized })
  } catch (error) {
    console.error('Purchases fetch error:', error)
    return NextResponse.json({ purchases: [] }, { status: 500 })
  }
}
