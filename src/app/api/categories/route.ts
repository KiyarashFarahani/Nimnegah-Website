import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const categories = await payload.find({
      collection: 'categories',
      depth: 1,
      sort: 'name',
    })

    return NextResponse.json({ categories: categories.docs })
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json({ categories: [] }, { status: 500 })
  }
}
