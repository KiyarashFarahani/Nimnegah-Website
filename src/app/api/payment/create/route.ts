import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { initializePayment } from '@/lib/zarinpal'
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

    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
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
        { error: 'You are already enrolled in this course' },
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

    const order = await payload.create({
      collection: 'orders',
      draft: false,
      overrideAccess: true,
      data: {
        user: auth.user.id,
        course: course.id,
        amount: effectiveAmount,
        status: 'pending',
        ...(discountApplied
          ? { originalAmount, discountAmount, coupon: couponId }
          : {}),
      },
    })

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
