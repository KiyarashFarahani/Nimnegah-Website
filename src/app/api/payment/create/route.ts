import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentRedirectUrl, initializePayment } from '@/lib/zarinpal'
import { authenticateRequest } from '@/lib/auth'
import { resolveDiscountCoupon } from '@/lib/discount'

type PurchaseTarget = {
  kind: 'course' | 'product'
  id: number
  title: string
  slug: string
  price: number
  dashboardPath: string
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })
    const { courseId, productId, discountCode } = await request.json()
    const idempotencyKey = request.headers.get('Idempotency-Key')

    const hasCourseId = typeof courseId === 'number'
    const hasProductId = typeof productId === 'number'
    if (hasCourseId === hasProductId) {
      return NextResponse.json(
        { error: 'Provide exactly one of courseId or productId' },
        { status: 400 },
      )
    }

    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return NextResponse.json({ error: 'Invalid Idempotency-Key' }, { status: 400 })
    }

    let target: PurchaseTarget

    if (hasCourseId) {
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

      target = {
        kind: 'course',
        id: course.id,
        title: course.title,
        slug: course.slug ?? String(course.id),
        price: course.price,
        dashboardPath: `/dashboard/learn/${course.slug ?? course.id}`,
      }
    } else {
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      if (product.status !== 'published') {
        return NextResponse.json({ error: 'Product is not available' }, { status: 400 })
      }

      target = {
        kind: 'product',
        id: product.id,
        title: product.title,
        slug: product.slug ?? String(product.id),
        price: product.price,
        dashboardPath: `/dashboard/products/${product.slug ?? product.id}`,
      }
    }

    const isFree = typeof target.price === 'number' && target.price <= 0

    if (target.kind === 'course') {
      const existingEnrollment = await payload.find({
        collection: 'enrollments',
        where: {
          and: [
            { user: { equals: auth.user.id } },
            { course: { equals: target.id } },
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
    } else {
      const existingPurchase = await payload.find({
        collection: 'product-purchases',
        where: {
          and: [
            { user: { equals: auth.user.id } },
            { product: { equals: target.id } },
          ],
        },
        limit: 1,
      })

      if (existingPurchase.docs.length > 0) {
        return NextResponse.json(
          { error: 'You have already purchased this product', enrolled: true },
          { status: 409 },
        )
      }
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
      const orderCourseId = existingOrder.course
        ? typeof existingOrder.course === 'object' ? existingOrder.course.id : existingOrder.course
        : null
      const orderProductId = existingOrder.product
        ? typeof existingOrder.product === 'object' ? existingOrder.product.id : existingOrder.product
        : null

      const matchesTarget = target.kind === 'course'
        ? orderCourseId === target.id
        : orderProductId === target.id

      if (orderUserId !== auth.user.id || !matchesTarget) {
        return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 })
      }

      if (existingOrder.status === 'completed') {
        return NextResponse.json({
          success: true,
          enrolled: true,
          redirectUrl: target.dashboardPath,
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

    const orderTargetField = target.kind === 'course'
      ? { course: target.id }
      : { product: target.id }

    // Free item: grant access directly without payment
    if (isFree) {
      const order = await payload.create({
        collection: 'orders',
        draft: false,
        overrideAccess: true,
        data: {
          user: auth.user.id,
          ...orderTargetField,
          amount: 0,
          status: 'completed',
          idempotencyKey,
        },
      })

      await grantAccess(payload, auth.user.id, target, order.id)

      return NextResponse.json({
        success: true,
        enrolled: true,
        redirectUrl: target.dashboardPath,
      })
    }

    if (typeof target.price !== 'number' || target.price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    let effectiveAmount = target.price
    let discountApplied = false
    let couponId: number | null = null
    let originalAmount: number | null = null
    let discountAmount: number | null = null

    if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
      const discount = await resolveDiscountCoupon(payload, {
        code: discountCode,
        price: target.price,
        userId: auth.user.id,
        ...(target.kind === 'course' ? { course: target.id } : { product: target.id }),
      })

      if (discount.valid) {
        effectiveAmount = discount.finalAmount
        discountApplied = true
        couponId = discount.coupon.id
        originalAmount = discount.originalAmount
        discountAmount = discount.discountAmount

        // Fully discounted: grant access directly without a bank payment
        if (effectiveAmount <= 0) {
          const order = await payload.create({
            collection: 'orders',
            draft: false,
            overrideAccess: true,
            data: {
              user: auth.user.id,
              ...orderTargetField,
              amount: 0,
              originalAmount,
              discountAmount,
              coupon: couponId,
              status: 'completed',
              idempotencyKey,
            },
          })

          await grantAccess(payload, auth.user.id, target, order.id)

          return NextResponse.json({
            success: true,
            enrolled: true,
            redirectUrl: target.dashboardPath,
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
          ...orderTargetField,
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
      const orderCourseId = duplicateOrder.course
        ? typeof duplicateOrder.course === 'object' ? duplicateOrder.course.id : duplicateOrder.course
        : null
      const orderProductId = duplicateOrder.product
        ? typeof duplicateOrder.product === 'object' ? duplicateOrder.product.id : duplicateOrder.product
        : null
      const matchesTarget = target.kind === 'course'
        ? orderCourseId === target.id
        : orderProductId === target.id

      if (orderUserId !== auth.user.id || !matchesTarget) {
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

    const description = target.kind === 'course'
      ? `خرید دوره: ${target.title}`
      : `خرید فایل: ${target.title}`

    const payment = await initializePayment(
      effectiveAmount,
      description,
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

async function grantAccess(
  payload: Awaited<ReturnType<typeof getPayload>>,
  userId: number,
  target: PurchaseTarget,
  orderId: number,
) {
  if (target.kind === 'course') {
    await payload.create({
      collection: 'enrollments',
      draft: false,
      overrideAccess: true,
      data: {
        user: userId,
        course: target.id,
        progress: 0,
      },
    })
  } else {
    await payload.create({
      collection: 'product-purchases',
      draft: false,
      overrideAccess: true,
      data: {
        user: userId,
        product: target.id,
        order: orderId,
      },
    })
  }
}
