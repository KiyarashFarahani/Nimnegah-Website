import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { initializePayment } from '@/lib/zarinpal'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const authResult = await payload.auth({
      headers: new Headers({ authorization: `Bearer ${token}` }),
    })

    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const order = await payload.create({
      collection: 'orders',
      draft: false,
      data: {
        user: authResult.user.id,
        course: course.id,
        amount: course.price,
        status: 'pending',
      },
    })

    const payment = await initializePayment(
      course.price,
      `خرید دوره: ${course.title}`,
    )

    if (!payment.success) {
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
