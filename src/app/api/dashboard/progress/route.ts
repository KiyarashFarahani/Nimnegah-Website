import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })

    const authResult = await payload.auth({ headers: request.headers })
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId, lessonId, completed } = await request.json()

    if (!enrollmentId || !lessonId) {
      return NextResponse.json({ error: 'enrollmentId and lessonId are required' }, { status: 400 })
    }

    const enrollment = await payload.findByID({
      collection: 'enrollments',
      id: enrollmentId,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const userId = typeof enrollment.user === 'object' ? enrollment.user.id : enrollment.user
    if (userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const completedLessons = Array.isArray(enrollment.completedLessons)
      ? [...enrollment.completedLessons]
      : []

    const existingIndex = completedLessons.findIndex(
      (cl: { lessonId: number | string }) => String(cl.lessonId) === String(lessonId)
    )

    if (completed && existingIndex === -1) {
      completedLessons.push({
        lessonId: Number(lessonId),
        completedAt: new Date().toISOString(),
      })
    } else if (!completed && existingIndex !== -1) {
      completedLessons.splice(existingIndex, 1)
    }

    const courseId = typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course
    const lessons = await payload.find({
      collection: 'lessons',
      where: { course: { equals: courseId } },
    })
    const totalLessons = lessons.totalDocs
    const progress = totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0

    const updated = await payload.update({
      collection: 'enrollments',
      id: enrollmentId,
      data: {
        completedLessons,
        progress,
        lastAccessedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ enrollment: updated })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
