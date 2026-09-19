import { sql } from '@payloadcms/db-postgres'
import {
  commitTransaction,
  createLocalReq,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'

export async function runInTransaction<T>(
  payload: Payload,
  operation: (req: PayloadRequest) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('Failed to start transaction')

  const req = await createLocalReq({ req: { transactionID } as never }, payload)
  try {
    const result = await operation(req)
    await commitTransaction(req)
    return result
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}

async function executeInTransaction(
  payload: Payload,
  req: PayloadRequest,
  statement: unknown,
) {
  const transactionID = await req.transactionID
  const db = payload.db.sessions?.[String(transactionID)]?.db as
    | { execute: (query: unknown) => Promise<unknown> }
    | undefined
  if (!db) throw new Error('Transaction session not found')
  await db.execute(statement)
}

export function lockEnrollment(
  payload: Payload,
  req: PayloadRequest,
  userId: number,
  courseId: number,
) {
  return executeInTransaction(
    payload,
    req,
    sql`SELECT pg_advisory_xact_lock(${userId}, ${courseId})`,
  )
}

export function lockOrder(payload: Payload, req: PayloadRequest, orderId: number) {
  return executeInTransaction(
    payload,
    req,
    sql`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`,
  )
}

export function lockCoupon(payload: Payload, req: PayloadRequest, couponId: number) {
  return executeInTransaction(
    payload,
    req,
    sql`SELECT id FROM coupons WHERE id = ${couponId} FOR UPDATE`,
  )
}

export async function incrementCouponUsage(
  payload: Payload,
  req: PayloadRequest,
  couponId: number,
) {
  const coupon = await payload.findByID({
    collection: 'coupons',
    id: couponId,
    depth: 0,
    overrideAccess: true,
    req,
  })
  await payload.update({
    collection: 'coupons',
    id: couponId,
    data: { timesUsed: (coupon.timesUsed ?? 0) + 1 },
    overrideAccess: true,
    req,
  })
}
