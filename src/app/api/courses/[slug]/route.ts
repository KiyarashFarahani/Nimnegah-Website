import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    const courses = await payload.find({
      collection: 'courses',
      depth: 2,
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
    })

    const course = courses.docs[0]
    if (!course) {
      return NextResponse.json({ course: null }, { status: 404 })
    }

    const lessons = await payload.find({
      collection: 'lessons',
      depth: 1,
      where: {
        course: { equals: course.id },
      },
      sort: 'order',
    })

    return NextResponse.json({ course, lessons: lessons.docs })
  } catch (error) {
    console.error('Course detail error:', error)
    return NextResponse.json({ course: null, lessons: [] }, { status: 500 })
  }
}
