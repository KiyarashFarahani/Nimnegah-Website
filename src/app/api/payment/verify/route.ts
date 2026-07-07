import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyPayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const { searchParams } = new URL(request.url)
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')

    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(
        new URL('/payment/failed?reason=cancelled', appUrl),
      )
    }

    const payload = await getPayload({ config })

    const orders = await payload.find({
      collection: 'orders',
      where: { authority: { equals: authority } },
      limit: 1,
    })

    if (orders.docs.length === 0) {
      return NextResponse.redirect(
        new URL('/payment/failed?reason=order_not_found', appUrl),
      )
    }

    const order = orders.docs[0]

    if (order.status === 'completed') {
      const course = await payload.findByID({
        collection: 'courses',
        id: typeof order.course === 'object' ? order.course.id : order.course,
      })
      return NextResponse.redirect(
        new URL(`/payment/success?course=${course.slug}`, appUrl),
      )
    }

    const auth = await authenticateRequest(request)
    if (auth.success) {
      const orderUserId = typeof order.user === 'object' ? order.user.id : order.user
      if (orderUserId !== auth.user.id) {
        return NextResponse.redirect(
          new URL('/payment/failed?reason=unauthorized', appUrl),
        )
      }
    }

    const courseId = typeof order.course === 'object' ? order.course.id : order.course
    const userId = typeof order.user === 'object' ? order.user.id : order.user

    const result = await verifyPayment(authority, order.amount)

    if (result.success) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        draft: false,
        overrideAccess: true,
        data: {
          status: 'completed',
          zarinpalRefId: String(result.refId),
        },
      })

      const existingEnrollment = await payload.find({
        collection: 'enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
      })

      const course = await payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      if (existingEnrollment.docs.length === 0) {
        await payload.create({
          collection: 'enrollments',
          draft: false,
          overrideAccess: true,
          data: {
            user: userId,
            course: courseId,
            progress: 0,
            enrolledAt: new Date().toISOString(),
          },
        })
      }

      return NextResponse.redirect(
        new URL(
          `/payment/success?course=${course.slug}&refId=${result.refId}`,
          appUrl,
        ),
      )
    } else {
      await payload.update({
        collection: 'orders',
        id: order.id,
        draft: false,
        overrideAccess: true,
        data: { status: 'failed' },
      })

      const reason = result.code === -1 ? 'verify_failed' : 'payment_failed'
      return NextResponse.redirect(
        new URL(`/payment/failed?reason=${reason}`, appUrl),
      )
    }
  } catch (error) {
    console.error('Payment verify error:', error)
    return NextResponse.redirect(
      new URL('/payment/failed?reason=server_error', appUrl),
    )
  }
}
