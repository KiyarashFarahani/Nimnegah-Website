import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import { lockEnrollment, runInTransaction } from '@/lib/payload-transaction'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })
    const { enrollmentId, lessonId, completed } = await request.json()
    if (!Number.isInteger(enrollmentId) || !Number.isInteger(lessonId) || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Valid enrollmentId, lessonId, and completed are required' },
        { status: 400 },
      )
    }

    const currentEnrollment = await payload.findByID({
      collection: 'enrollments',
      id: enrollmentId,
      depth: 0,
    })
    const userId = typeof currentEnrollment.user === 'object'
      ? currentEnrollment.user.id
      : currentEnrollment.user
    const courseId = typeof currentEnrollment.course === 'object'
      ? currentEnrollment.course.id
      : currentEnrollment.course
    if (userId !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await runInTransaction(payload, async (req) => {
      await lockEnrollment(payload, req, userId, courseId)
      const [enrollment, lesson] = await Promise.all([
        payload.findByID({
          collection: 'enrollments',
          id: enrollmentId,
          depth: 0,
          req,
        }),
        payload.findByID({
          collection: 'lessons',
          id: lessonId,
          depth: 0,
          req,
        }),
      ])

      const lessonCourseId = typeof lesson.course === 'object'
        ? lesson.course.id
        : lesson.course
      if (lessonCourseId !== courseId) throw new Error('LESSON_COURSE_MISMATCH')

      const completedLessons = Array.isArray(enrollment.completedLessons)
        ? [...enrollment.completedLessons]
        : []
      const existingIndex = completedLessons.findIndex(
        (item) => Number(item.lessonId) === lessonId,
      )
      if (completed && existingIndex === -1) {
        completedLessons.push({
          lessonId,
          completedAt: new Date().toISOString(),
        })
      } else if (!completed && existingIndex !== -1) {
        completedLessons.splice(existingIndex, 1)
      }

      const { totalDocs: totalLessons } = await payload.count({
        collection: 'lessons',
        where: { course: { equals: courseId } },
        req,
      })
      const progress = totalLessons > 0
        ? Math.round((completedLessons.length / totalLessons) * 100)
        : 0

      return payload.update({
        collection: 'enrollments',
        id: enrollmentId,
        overrideAccess: true,
        req,
        data: {
          completedLessons,
          progress,
          lastAccessedAt: new Date().toISOString(),
        },
      })
    })

    return NextResponse.json({ enrollment: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'LESSON_COURSE_MISMATCH') {
      return NextResponse.json({ error: 'Lesson does not belong to this course' }, { status: 400 })
    }
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
