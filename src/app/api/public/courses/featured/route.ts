import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const courses = await payload.find({
      collection: 'courses',
      depth: 2,
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 3,
      sort: 'createdAt',
    })

    return NextResponse.json({ courses: courses.docs })
  } catch (error) {
    console.error('Featured courses error:', error)
    return NextResponse.json({ courses: [] }, { status: 500 })
  }
}
