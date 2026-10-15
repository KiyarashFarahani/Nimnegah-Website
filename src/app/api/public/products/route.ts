import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const products = await payload.find({
      collection: 'products',
      depth: 1,
      where: {
        status: {
          in: ['published', 'coming_soon'],
        },
      },
      sort: '-createdAt',
      overrideAccess: true,
    })

    // Strip file docs (only expose the count publicly)
    const sanitized = products.docs.map((product) => {
      const filesCount = Array.isArray(product.files) ? product.files.length : 0
      const rest = { ...product }
      delete rest.files
      return { ...rest, filesCount }
    })

    return NextResponse.json({ products: sanitized })
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
