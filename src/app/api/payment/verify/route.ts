import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyPayment } from '@/lib/zarinpal'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')

    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(
        new URL('/courses?error=payment_failed', process.env.NEXT_PUBLIC_APP_URL!),
      )
    }

    const payload = await getPayload({ config })

    const orders = await payload.find({
      collection: 'orders',
      where: { authority: { equals: authority } },
    })

    if (orders.docs.length === 0) {
      return NextResponse.redirect(
        new URL('/courses?error=order_not_found', process.env.NEXT_PUBLIC_APP_URL!),
      )
    }

    const order = orders.docs[0]
    const courseId = typeof order.course === 'object' ? order.course.id : order.course
    const userId = typeof order.user === 'object' ? order.user.id : order.user
    const result = await verifyPayment(authority, order.amount)

    if (result.success) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        draft: false,
        data: {
          status: 'completed',
          zarinpalRefId: result.refId,
        },
      })

      await payload.create({
        collection: 'enrollments',
        draft: false,
        data: {
          user: userId,
          course: courseId,
          progress: 0,
          enrolledAt: new Date().toISOString(),
        },
      })

      const course = await payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      return NextResponse.redirect(
        new URL(`/dashboard/${course.slug}`, process.env.NEXT_PUBLIC_APP_URL!),
      )
    } else {
      await payload.update({
        collection: 'orders',
        id: order.id,
        draft: false,
        data: { status: 'failed' },
      })

      return NextResponse.redirect(
        new URL('/courses?error=payment_failed', process.env.NEXT_PUBLIC_APP_URL!),
      )
    }
  } catch (error) {
    console.error('Payment verify error:', error)
    return NextResponse.redirect(
      new URL('/courses?error=server_error', process.env.NEXT_PUBLIC_APP_URL!),
    )
  }
}
