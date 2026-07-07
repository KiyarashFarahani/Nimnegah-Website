import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import { createSpotPlayerLicense } from '@/lib/spotplayer'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { enrollmentId } = await request.json()

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const enrollments = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { id: { equals: enrollmentId } },
          { user: { equals: auth.user.id } },
        ],
      },
      limit: 1,
    })

    if (enrollments.docs.length === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const enrollment = enrollments.docs[0]

    if (enrollment.spotplayerLicenseKey) {
      return NextResponse.json({ licenseKey: enrollment.spotplayerLicenseKey })
    }

    const course = await payload.findByID({
      collection: 'courses',
      id: typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course,
    })

    if (course.courseType !== 'spotplayer' || !course.spotplayerCourseIds?.length) {
      return NextResponse.json({ error: 'Course is not a SpotPlayer course' }, { status: 400 })
    }

    const courseIds = course.spotplayerCourseIds.map(
      (c: { courseId: string }) => c.courseId,
    )

    const user = await payload.findByID({
      collection: 'users',
      id: auth.user.id,
    })

    const licenseResult = await createSpotPlayerLicense(
      user.name || user.phone,
      courseIds,
      user.phone,
    )

    if (!licenseResult.success) {
      return NextResponse.json({ error: licenseResult.error }, { status: 500 })
    }

    await payload.update({
      collection: 'enrollments',
      id: enrollment.id,
      draft: false,
      overrideAccess: true,
      data: {
        spotplayerLicenseKey: licenseResult.key,
      },
    })

    return NextResponse.json({ licenseKey: licenseResult.key })
  } catch (error) {
    console.error('Generate license error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
