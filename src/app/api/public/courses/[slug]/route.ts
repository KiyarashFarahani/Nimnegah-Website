import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

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

    let isEnrolled = false
    let userId: number | null = null

    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('payload-token')?.value
      if (token) {
        const secret = new TextEncoder().encode(process.env.PAYLOAD_SECRET!)
        const { payload: jwtPayload } = await jwtVerify(token, secret)
        userId = Number(jwtPayload.id)

        if (userId) {
          const enrollment = await payload.find({
            collection: 'enrollments',
            where: {
              and: [
                { user: { equals: userId } },
                { course: { equals: course.id } },
              ],
            },
            limit: 1,
          })
          isEnrolled = enrollment.docs.length > 0
        }
      }
    } catch {
      // Not authenticated, that's fine
    }

    return NextResponse.json({
      course,
      lessons: lessons.docs,
      isEnrolled,
    })
  } catch (error) {
    console.error('Course detail error:', error)
    return NextResponse.json({ course: null, lessons: [] }, { status: 500 })
  }
}
