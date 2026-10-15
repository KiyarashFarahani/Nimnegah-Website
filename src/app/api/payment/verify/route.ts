import { NextResponse } from 'next/server'
import {
  type Payload,
  getPayload,
  createLocalReq,
  commitTransaction,
  killTransaction,
} from 'payload'
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

    const courseId = order.course
      ? typeof order.course === 'object' ? order.course.id : order.course
      : null
    const productId = order.product
      ? typeof order.product === 'object' ? order.product.id : order.product
      : null
    const userId = typeof order.user === 'object' ? order.user.id : order.user

    if (!courseId && !productId) {
      return NextResponse.redirect(
        new URL('/payment/failed?reason=server_error', appUrl),
      )
    }

    if (order.status === 'completed') {
      const successUrl = await buildSuccessUrl(payload, courseId, productId, null)
      return NextResponse.redirect(new URL(successUrl, appUrl))
    }

    const auth = await authenticateRequest(request)
    if (auth.success) {
      if (userId !== auth.user.id) {
        return NextResponse.redirect(
          new URL('/payment/failed?reason=unauthorized', appUrl),
        )
      }
    }

    const result = await verifyPayment(authority, order.amount)

    if (result.success) {
      await completePayment(payload, userId, courseId, productId, order.id, result.refId)

      const successUrl = await buildSuccessUrl(payload, courseId, productId, result.refId)
      return NextResponse.redirect(new URL(successUrl, appUrl))
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

async function buildSuccessUrl(
  payload: Payload,
  courseId: number | null,
  productId: number | null,
  refId: number | null,
): Promise<string> {
  const refParam = refId != null ? `&refId=${refId}` : ''

  if (productId) {
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
    })
    return `/payment/success?product=${product.slug}${refParam}`
  }

  const course = await payload.findByID({
    collection: 'courses',
    id: courseId!,
  })
  return `/payment/success?course=${course.slug}${refParam}`
}

async function completePayment(
  payload: Payload,
  userId: number,
  courseId: number | null,
  productId: number | null,
  orderId: number,
  refId: number,
) {
  const transactionID = await payload.db.beginTransaction()

  if (!transactionID) {
    throw new Error('Failed to start transaction')
  }

  const req = await createLocalReq({ req: { transactionID } as never }, payload)

  try {
    await payload.update({
      collection: 'orders',
      id: orderId,
      draft: false,
      overrideAccess: true,
      req,
      data: {
        status: 'completed',
        zarinpalRefId: String(refId),
      },
    })

    if (courseId) {
      const existingEnrollment = await payload.find({
        collection: 'enrollments',
        where: {
          and: [
            { user: { equals: userId } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        req,
      })

      if (existingEnrollment.docs.length === 0) {
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
    } else if (productId) {
      const existingPurchase = await payload.find({
        collection: 'product-purchases',
        where: {
          and: [
            { user: { equals: userId } },
            { product: { equals: productId } },
          ],
        },
        limit: 1,
        req,
      })

      if (existingPurchase.docs.length === 0) {
        await payload.create({
          collection: 'product-purchases',
          draft: false,
          overrideAccess: true,
          req,
          data: {
            user: userId,
            product: productId,
            order: orderId,
            purchasedAt: new Date().toISOString(),
          },
        })
      }
    }

    await commitTransaction(req)
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}
