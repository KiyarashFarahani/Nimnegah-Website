import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { courseSlug } = await params
    const payload = await getPayload({ config })

    const courses = await payload.find({
      collection: 'courses',
      depth: 1,
      where: {
        slug: { equals: courseSlug },
        status: { equals: 'published' },
      },
      limit: 1,
    })

    const course = courses.docs[0]
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const enrollments = await payload.find({
      collection: 'enrollments',
      where: {
        user: { equals: auth.user.id },
        course: { equals: course.id },
      },
      limit: 1,
    })

    if (enrollments.docs.length === 0) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    const enrollment = enrollments.docs[0]

    const lessons = await payload.find({
      collection: 'lessons',
      depth: 1,
      where: {
        course: { equals: course.id },
      },
      sort: 'order',
    })

    return NextResponse.json({
      course,
      lessons: lessons.docs,
      enrollment,
    })
  } catch (error) {
    console.error('Course detail error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
