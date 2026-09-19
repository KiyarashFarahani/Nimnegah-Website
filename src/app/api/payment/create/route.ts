import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentRedirectUrl, initializePayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'
import { resolveDiscountCoupon } from '@/lib/discount'

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

    const isFree = typeof course.price === 'number' && course.price <= 0

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
        { error: 'You are already enrolled in this course', enrolled: true },
        { status: 409 },
      )
    }

    const existingOrders = await payload.find({
      collection: 'orders',
      where: { idempotencyKey: { equals: idempotencyKey } },
      depth: 0,
      limit: 1,
    })
    const existingOrder = existingOrders.docs[0]

    if (existingOrder) {
      const orderUserId = typeof existingOrder.user === 'object' ? existingOrder.user.id : existingOrder.user
      const orderCourseId = typeof existingOrder.course === 'object' ? existingOrder.course.id : existingOrder.course

      if (orderUserId !== auth.user.id || orderCourseId !== course.id) {
        return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 })
      }

      if (existingOrder.status === 'completed') {
        return NextResponse.json({
          success: true,
          enrolled: true,
          redirectUrl: `/dashboard/learn/${course.slug}`,
        })
      }

      if (existingOrder.status === 'pending' && existingOrder.authority) {
        return NextResponse.json({
          success: true,
          redirectUrl: getPaymentRedirectUrl(existingOrder.authority),
          orderId: existingOrder.id,
        })
      }

      return NextResponse.json(
        {
          error: 'Payment request is already being processed',
          preserveIdempotencyKey: existingOrder.status === 'pending',
        },
        { status: 409 },
      )
    }

    // Free course: enroll directly without payment
    if (isFree) {
      await payload.create({
        collection: 'orders',
        draft: false,
        overrideAccess: true,
        data: {
          user: auth.user.id,
          course: course.id,
          amount: 0,
          status: 'completed',
          idempotencyKey,
        },
      })

      await payload.create({
        collection: 'enrollments',
        draft: false,
        overrideAccess: true,
        data: {
          user: auth.user.id,
          course: course.id,
          progress: 0,
        },
      })

      return NextResponse.json({
        success: true,
        enrolled: true,
        redirectUrl: `/dashboard/learn/${course.slug}`,
      })
    }

    if (typeof course.price !== 'number' || course.price <= 0) {
      return NextResponse.json({ error: 'Invalid course price' }, { status: 400 })
    }

    let effectiveAmount = course.price
    let discountApplied = false
    let couponId: number | null = null
    let originalAmount: number | null = null
    let discountAmount: number | null = null

    if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
      const discount = await resolveDiscountCoupon(payload, {
        code: discountCode,
        courseId: course.id,
        coursePrice: course.price,
        userId: auth.user.id,
      })

      if (discount.valid) {
        effectiveAmount = discount.finalAmount
        discountApplied = true
        couponId = discount.coupon.id
        originalAmount = discount.originalAmount
        discountAmount = discount.discountAmount

        // Fully discounted: enroll directly without a bank payment
        if (effectiveAmount <= 0) {
          await payload.create({
            collection: 'orders',
            draft: false,
            overrideAccess: true,
            data: {
              user: auth.user.id,
              course: course.id,
              amount: 0,
              originalAmount,
              discountAmount,
              coupon: couponId,
              status: 'completed',
              idempotencyKey,
            },
          })

          await payload.create({
            collection: 'enrollments',
            draft: false,
            overrideAccess: true,
            data: {
              user: auth.user.id,
              course: course.id,
              progress: 0,
            },
          })

          return NextResponse.json({
            success: true,
            enrolled: true,
            redirectUrl: `/dashboard/learn/${course.slug}`,
          })
        }
      } else {
        return NextResponse.json({ error: discount.message }, { status: 400 })
      }
    }

    let order
    try {
      order = await payload.create({
        collection: 'orders',
        draft: false,
        overrideAccess: true,
        data: {
          user: auth.user.id,
          course: course.id,
          amount: effectiveAmount,
          status: 'pending',
          idempotencyKey,
          ...(discountApplied
            ? { originalAmount, discountAmount, coupon: couponId }
            : {}),
        },
      })
    } catch (error) {
      const duplicate = await payload.find({
        collection: 'orders',
        where: { idempotencyKey: { equals: idempotencyKey } },
        depth: 0,
        limit: 1,
      })
      const duplicateOrder = duplicate.docs[0]

      if (!duplicateOrder) throw error

      const orderUserId = typeof duplicateOrder.user === 'object' ? duplicateOrder.user.id : duplicateOrder.user
      const orderCourseId = typeof duplicateOrder.course === 'object' ? duplicateOrder.course.id : duplicateOrder.course
      if (orderUserId !== auth.user.id || orderCourseId !== course.id) {
        return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 })
      }
      if (duplicateOrder.authority) {
        return NextResponse.json({
          success: true,
          redirectUrl: getPaymentRedirectUrl(duplicateOrder.authority),
          orderId: duplicateOrder.id,
        })
      }
      return NextResponse.json(
        {
          error: 'Payment request is already being processed',
          preserveIdempotencyKey: true,
        },
        { status: 409 },
      )
    }

    const payment = await initializePayment(
      effectiveAmount,
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
        overrideAccess: true,
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: payment.error }, { status: 500 })
    }

    await payload.update({
      collection: 'orders',
      id: order.id,
      draft: false,
      overrideAccess: true,
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
