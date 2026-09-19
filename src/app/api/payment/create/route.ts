import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentRedirectUrl, initializePayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'
import {
  normalizeCouponCode,
  PAYMENT_RESERVATION_TTL_MS,
  resolveDiscountCoupon,
} from '@/lib/discount'
import {
  lockCoupon,
  lockEnrollment,
  incrementCouponUsage,
  runInTransaction,
} from '@/lib/payload-transaction'

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })
    const { courseId, discountCode } = await request.json()
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
    }
    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return NextResponse.json({ error: 'Invalid Idempotency-Key' }, { status: 400 })
    }

    const course = await payload.findByID({ collection: 'courses', id: courseId })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (course.status !== 'published') {
      return NextResponse.json({ error: 'Course is not available' }, { status: 400 })
    }

    const checkout = await runInTransaction(payload, async (req) => {
      await lockEnrollment(payload, req, auth.user.id, course.id)

      const enrollment = await payload.find({
        collection: 'enrollments',
        where: {
          and: [
            { user: { equals: auth.user.id } },
            { course: { equals: course.id } },
          ],
        },
        depth: 0,
        limit: 1,
        req,
      })
      if (enrollment.docs.length > 0) return { kind: 'enrolled' } as const

      const idempotentOrders = await payload.find({
        collection: 'orders',
        where: { idempotencyKey: { equals: idempotencyKey } },
        depth: 0,
        limit: 1,
        req,
      })
      const idempotentOrder = idempotentOrders.docs[0]
      if (idempotentOrder) {
        const userId = typeof idempotentOrder.user === 'object' ? idempotentOrder.user.id : idempotentOrder.user
        const orderCourseId = typeof idempotentOrder.course === 'object' ? idempotentOrder.course.id : idempotentOrder.course
        if (userId !== auth.user.id || orderCourseId !== course.id) {
          return { kind: 'conflict' } as const
        }
        return { kind: 'existing', order: idempotentOrder } as const
      }

      const pendingOrders = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { user: { equals: auth.user.id } },
            { course: { equals: course.id } },
            { status: { equals: 'pending' } },
          ],
        },
        depth: 0,
        limit: 1,
        sort: '-createdAt',
        req,
      })
      if (pendingOrders.docs[0]) {
        const pendingOrder = pendingOrders.docs[0]
        const isActive = Date.now() - new Date(pendingOrder.createdAt).getTime()
          < PAYMENT_RESERVATION_TTL_MS
        if (isActive) return { kind: 'existing', order: pendingOrder } as const
        await payload.update({
          collection: 'orders',
          id: pendingOrder.id,
          overrideAccess: true,
          req,
          data: { status: 'failed' },
        })
      }

      const isFree = typeof course.price === 'number' && course.price <= 0
      if (!isFree && (typeof course.price !== 'number' || course.price <= 0)) {
        return { kind: 'invalid-price' } as const
      }

      let amount = isFree ? 0 : course.price
      let couponId: number | null = null
      let originalAmount: number | null = null
      let discountAmount: number | null = null

      if (!isFree && discountCode && typeof discountCode === 'string' && discountCode.trim()) {
        const candidates = await payload.find({
          collection: 'coupons',
          where: { code: { equals: normalizeCouponCode(discountCode) } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
        })
        if (!candidates.docs[0]) {
          return { kind: 'invalid-discount', message: 'کد تخفیف معتبر نیست' } as const
        }

        await lockCoupon(payload, req, candidates.docs[0].id)
        const discount = await resolveDiscountCoupon(payload, {
          code: discountCode,
          courseId: course.id,
          coursePrice: course.price,
          userId: auth.user.id,
        }, req)
        if (!discount.valid) {
          return { kind: 'invalid-discount', message: discount.message } as const
        }

        amount = discount.finalAmount
        couponId = discount.coupon.id
        originalAmount = discount.originalAmount
        discountAmount = discount.discountAmount
      }

      const completed = amount <= 0
      const order = await payload.create({
        collection: 'orders',
        draft: false,
        overrideAccess: true,
        req,
        data: {
          user: auth.user.id,
          course: course.id,
          amount,
          status: completed ? 'completed' : 'pending',
          idempotencyKey,
          ...(couponId ? { originalAmount, discountAmount, coupon: couponId } : {}),
        },
      })

      if (completed) {
        await payload.create({
          collection: 'enrollments',
          draft: false,
          overrideAccess: true,
          req,
          data: { user: auth.user.id, course: course.id, progress: 0 },
        })
        if (couponId) await incrementCouponUsage(payload, req, couponId)
      }

      return { kind: 'created', order, completed } as const
    })

    if (checkout.kind === 'enrolled') {
      return NextResponse.json(
        { error: 'You are already enrolled in this course', enrolled: true },
        { status: 409 },
      )
    }
    if (checkout.kind === 'conflict') {
      return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 })
    }
    if (checkout.kind === 'invalid-price') {
      return NextResponse.json({ error: 'Invalid course price' }, { status: 400 })
    }
    if (checkout.kind === 'invalid-discount') {
      return NextResponse.json({ error: checkout.message }, { status: 400 })
    }
    if (checkout.kind === 'existing') {
      if (checkout.order.status === 'completed') {
        return NextResponse.json({
          success: true,
          enrolled: true,
          redirectUrl: `/dashboard/learn/${course.slug}`,
        })
      }
      if (checkout.order.status === 'pending' && checkout.order.authority) {
        return NextResponse.json({
          success: true,
          redirectUrl: getPaymentRedirectUrl(checkout.order.authority),
          orderId: checkout.order.id,
        })
      }
      return NextResponse.json(
        {
          error: 'Payment request is already being processed',
          preserveIdempotencyKey: checkout.order.status === 'pending',
        },
        { status: 409 },
      )
    }
    if (checkout.completed) {
      return NextResponse.json({
        success: true,
        enrolled: true,
        redirectUrl: `/dashboard/learn/${course.slug}`,
      })
    }

    const payment = await initializePayment(
      checkout.order.amount,
      `خرید دوره: ${course.title}`,
      {
        mobile: auth.user.phone,
        email: `${auth.user.phone}@nimnegah.local`,
        orderId: String(checkout.order.id),
      },
    )

    if (!payment.success) {
      await payload.update({
        collection: 'orders',
        id: checkout.order.id,
        draft: false,
        overrideAccess: true,
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: payment.error }, { status: 500 })
    }

    await payload.update({
      collection: 'orders',
      id: checkout.order.id,
      draft: false,
      overrideAccess: true,
      data: { authority: payment.authority },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      orderId: checkout.order.id,
    })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
