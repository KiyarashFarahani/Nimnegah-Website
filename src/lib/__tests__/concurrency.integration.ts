import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import redis, {
  claimResendCooldown,
  consumeOTP,
  releaseResendCooldown,
  setOTP,
} from '@/lib/redis'
import { COOKIE_NAME } from '@/lib/cookie'
import { POST as updateProgress } from '@/app/api/dashboard/progress/route'
import { POST as createPayment } from '@/app/api/payment/create/route'

describe.sequential('parallel user operations', () => {
  let payload: Payload
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const created: {
    courseId?: number
    enrollmentId?: number
    lessonIds: number[]
    userId?: number
  } = { lessonIds: [] }

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    if (created.enrollmentId) {
      await payload.delete({ collection: 'enrollments', id: created.enrollmentId })
    }
    for (const id of created.lessonIds) {
      await payload.delete({ collection: 'lessons', id })
    }
    if (created.courseId) {
      await payload.delete({ collection: 'courses', id: created.courseId })
    }
    if (created.userId) {
      await payload.delete({ collection: 'users', id: created.userId })
    }
    redis.disconnect()
  })

  it('consumes an OTP exactly once across parallel requests', async () => {
    const phone = `otp-${suffix}`
    await setOTP(phone, '123456')
    const results = await Promise.all(
      Array.from({ length: 20 }, () => consumeOTP(phone, '123456')),
    )
    expect(results.filter(Boolean)).toHaveLength(1)
  })

  it('allows only one parallel resend cooldown claimant', async () => {
    const phone = `cooldown-${suffix}`
    const tokens = Array.from({ length: 20 }, () => crypto.randomUUID())
    const results = await Promise.all(
      tokens.map((token) => claimResendCooldown(phone, token)),
    )
    const winner = results.findIndex((result) => result.allowed)
    expect(results.filter((result) => result.allowed)).toHaveLength(1)
    await releaseResendCooldown(phone, tokens[winner])
  })

  it('preserves both parallel lesson completions', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        phone: `09${String(Date.now()).slice(-9)}`,
        email: `concurrency-${suffix}@example.test`,
        name: 'Concurrency Test',
        role: 'student',
      },
    })
    created.userId = user.id

    const course = await payload.create({
      collection: 'courses',
      data: {
        title: `Concurrency ${suffix}`,
        slug: `concurrency-${suffix}`,
        price: 0,
        status: 'published',
      },
    })
    created.courseId = course.id

    for (const order of [1, 2]) {
      const lesson = await payload.create({
        collection: 'lessons',
        data: {
          title: `Lesson ${order}`,
          course: course.id,
          duration: 60,
          order,
        },
      })
      created.lessonIds.push(lesson.id)
    }

    const enrollment = await payload.create({
      collection: 'enrollments',
      data: { user: user.id, course: course.id, progress: 0 },
    })
    created.enrollmentId = enrollment.id

    const token = await new SignJWT({ id: user.id, collection: 'users' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.PAYLOAD_SECRET!))

    const responses = await Promise.all(created.lessonIds.map((lessonId) =>
      updateProgress(new Request('http://localhost/api/dashboard/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `${COOKIE_NAME}=${token}`,
        },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          lessonId,
          completed: true,
        }),
      }))))
    expect(responses.every((response) => response.ok)).toBe(true)

    const updated = await payload.findByID({
      collection: 'enrollments',
      id: enrollment.id,
      depth: 0,
    })
    expect(updated.completedLessons).toHaveLength(2)
    expect(updated.progress).toBe(100)
  })

  it('admits one parallel checkout for a one-use coupon', async () => {
    const users: number[] = []
    let courseId: number | undefined
    let couponId: number | undefined
    try {
      const course = await payload.create({
        collection: 'courses',
        data: {
          title: `Coupon Race ${suffix}`,
          slug: `coupon-race-${suffix}`,
          price: 100000,
          status: 'published',
        },
      })
      courseId = course.id
      const coupon = await payload.create({
        collection: 'coupons',
        data: {
          code: `RACE${Date.now()}`,
          type: 'percent',
          value: 100,
          status: 'active',
          scope: 'all',
          maxUses: 1,
          perUserLimit: 1,
        },
      })
      couponId = coupon.id

      const requests = []
      for (const prefix of ['093', '094']) {
        const user = await payload.create({
          collection: 'users',
          data: {
            phone: `${prefix}${String(Date.now()).slice(-8)}`,
            email: `${prefix}-${suffix}@example.test`,
            name: 'Coupon Race',
            role: 'student',
          },
        })
        users.push(user.id)
        const token = await new SignJWT({ id: user.id, collection: 'users' })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('5m')
          .sign(new TextEncoder().encode(process.env.PAYLOAD_SECRET!))
        requests.push(new Request('http://localhost/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
            Cookie: `${COOKIE_NAME}=${token}`,
          },
          body: JSON.stringify({ courseId: course.id, discountCode: coupon.code }),
        }))
      }

      const responses = await Promise.all(requests.map(createPayment))
      expect(responses.map((response) => response.status).sort()).toEqual([200, 400])
      const [orders, enrollments, updatedCoupon] = await Promise.all([
        payload.count({ collection: 'orders', where: { coupon: { equals: coupon.id } } }),
        payload.count({ collection: 'enrollments', where: { course: { equals: course.id } } }),
        payload.findByID({ collection: 'coupons', id: coupon.id }),
      ])
      expect(orders.totalDocs).toBe(1)
      expect(enrollments.totalDocs).toBe(1)
      expect(updatedCoupon.timesUsed).toBe(1)
    } finally {
      if (courseId) {
        await payload.delete({ collection: 'enrollments', where: { course: { equals: courseId } } })
        await payload.delete({ collection: 'orders', where: { course: { equals: courseId } } })
      }
      if (couponId) await payload.delete({ collection: 'coupons', id: couponId })
      if (courseId) await payload.delete({ collection: 'courses', id: courseId })
      for (const id of users) await payload.delete({ collection: 'users', id })
    }
  })
})
