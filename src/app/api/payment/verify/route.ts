import { NextResponse } from 'next/server'
import { type Payload, getPayload } from 'payload'
import config from '@payload-config'
import { verifyPayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'
import {
  incrementCouponUsage,
  lockCoupon,
  lockEnrollment,
  lockOrder,
  runInTransaction,
} from '@/lib/payload-transaction'

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const { searchParams } = new URL(request.url)
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')

    if (!authority) {
      return NextResponse.redirect(new URL('/payment/failed?reason=cancelled', appUrl))
    }

    const payload = await getPayload({ config })
    const orders = await payload.find({
      collection: 'orders',
      where: { authority: { equals: authority } },
      depth: 0,
      limit: 1,
    })
    const order = orders.docs[0]
    if (!order) {
      return NextResponse.redirect(
        new URL('/payment/failed?reason=order_not_found', appUrl),
      )
    }

    const courseId = typeof order.course === 'object' ? order.course.id : order.course
    const userId = typeof order.user === 'object' ? order.user.id : order.user

    if (status !== 'OK') {
      return NextResponse.redirect(new URL('/payment/failed?reason=cancelled', appUrl))
    }

    if (order.status === 'completed') {
      const course = await payload.findByID({ collection: 'courses', id: courseId })
      return NextResponse.redirect(
        new URL(`/payment/success?course=${course.slug}`, appUrl),
      )
    }

    const auth = await authenticateRequest(request)
    if (auth.success && userId !== auth.user.id) {
      return NextResponse.redirect(
        new URL('/payment/failed?reason=unauthorized', appUrl),
      )
    }

    const result = await verifyPayment(authority, order.amount)
    if (!result.success) {
      await failPayment(payload, userId, courseId, order.id)
      const reason = result.code === -1 ? 'verify_failed' : 'payment_failed'
      return NextResponse.redirect(new URL(`/payment/failed?reason=${reason}`, appUrl))
    }

    await completePayment(payload, userId, courseId, order.id, result.refId)
    const course = await payload.findByID({ collection: 'courses', id: courseId })
    return NextResponse.redirect(
      new URL(
        `/payment/success?course=${course.slug}&refId=${result.refId}`,
        appUrl,
      ),
    )
  } catch (error) {
    console.error('Payment verify error:', error)
    return NextResponse.redirect(
      new URL('/payment/failed?reason=server_error', appUrl),
    )
  }
}

async function completePayment(
  payload: Payload,
  userId: number,
  courseId: number,
  orderId: number,
  refId: number,
) {
  await runInTransaction(payload, async (req) => {
    await lockEnrollment(payload, req, userId, courseId)
    await lockOrder(payload, req, orderId)

    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (order.status === 'completed') return

    const couponId = order.coupon
      ? typeof order.coupon === 'object'
        ? order.coupon.id
        : order.coupon
      : null
    if (couponId) await lockCoupon(payload, req, couponId)

    await payload.update({
      collection: 'orders',
      id: orderId,
      draft: false,
      overrideAccess: true,
      req,
      data: { status: 'completed', zarinpalRefId: String(refId) },
    })

    const enrollment = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { user: { equals: userId } },
          { course: { equals: courseId } },
        ],
      },
      depth: 0,
      limit: 1,
      req,
    })
    if (enrollment.docs.length === 0) {
      await payload.create({
        collection: 'enrollments',
        draft: false,
        overrideAccess: true,
        req,
        data: {
          user: userId,
          course: courseId,
          progress: 0,
          enrolledAt: new Date().toISOString(),
        },
      })
    }
    if (couponId) await incrementCouponUsage(payload, req, couponId)
  })
}

async function failPayment(
  payload: Payload,
  userId: number,
  courseId: number,
  orderId: number,
) {
  await runInTransaction(payload, async (req) => {
    await lockEnrollment(payload, req, userId, courseId)
    await lockOrder(payload, req, orderId)
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (order.status !== 'pending') return
    await payload.update({
      collection: 'orders',
      id: orderId,
      draft: false,
      overrideAccess: true,
      req,
      data: { status: 'failed' },
    })
  })
}
