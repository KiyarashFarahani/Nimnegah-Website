import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { initializePayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })
    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.status !== 'published') {
      return NextResponse.json({ error: 'Course is not available' }, { status: 400 })
    }

    const existingEnrollment = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { user: { equals: auth.user.id } },
          { course: { equals: course.id } },
        ],
      },
      limit: 1,
    })

    if (existingEnrollment.docs.length > 0) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 409 },
      )
    }

    const order = await payload.create({
      collection: 'orders',
      draft: false,
      data: {
        user: auth.user.id,
        course: course.id,
        amount: course.price,
        status: 'pending',
      },
    })

    const payment = await initializePayment(
      course.price,
      `خرید دوره: ${course.title}`,
      {
        mobile: auth.user.phone,
        email: `${auth.user.phone}@nimnegah.local`,
        orderId: String(order.id),
      },
    )

    if (!payment.success) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        draft: false,
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: payment.error }, { status: 500 })
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      draft: false,
      data: { authority: payment.authority },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
