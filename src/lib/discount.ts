import type { Payload } from 'payload'
import type { Coupon } from '@/payload-types'

export type DiscountStatus =
  | {
      valid: true
      coupon: Coupon
      originalAmount: number
      discountAmount: number
      finalAmount: number
    }
  | {
      valid: false
      message: string
    }

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export function calculateDiscountPrice(
  type: Coupon['type'],
  value: number,
  price: number,
): number {
  if (!price || price <= 0) return 0
  if (type === 'percent') {
    const pct = Math.min(100, Math.max(0, value))
    return Math.floor((price * (100 - pct)) / 100)
  }
  return Math.max(0, price - Math.max(0, value))
}

export function calculateDiscountAmount(
  type: Coupon['type'],
  value: number,
  price: number,
): number {
  return Math.max(0, price - calculateDiscountPrice(type, value, price))
}

export async function resolveDiscountCoupon(
  payload: Payload,
  opts: {
    code: string
    courseId: number
    coursePrice: number
    userId: number
  },
): Promise<DiscountStatus> {
  const normalized = normalizeCouponCode(opts.code)
  if (!normalized) {
    return { valid: false, message: 'کد تخفیف معتبر نیست' }
  }

  const { docs } = await payload.find({
    collection: 'coupons',
    where: { code: { equals: normalized } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const coupon = docs[0]
  if (!coupon || coupon.status !== 'active') {
    return { valid: false, message: 'کد تخفیف معتبر نیست' }
  }

  const now = Date.now()
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return { valid: false, message: 'کد تخفیف هنوز فعال نشده است' }
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return { valid: false, message: 'کد تخفیف منقضی شده است' }
  }

  if (coupon.scope === 'courses') {
    const ids = (coupon.courses ?? []).map((c) =>
      typeof c === 'object' ? c.id : c,
    )
    if (!ids.includes(opts.courseId)) {
      return { valid: false, message: 'این کد تخفیف برای این دوره قابل استفاده نیست' }
    }
  }

  if (coupon.maxUses && coupon.maxUses > 0) {
    const used = await payload.count({
      collection: 'orders',
      where: {
        and: [
          { coupon: { equals: coupon.id } },
          { status: { equals: 'completed' } },
        ],
      },
      overrideAccess: true,
    })
    if (used.totalDocs >= coupon.maxUses) {
      return {
        valid: false,
        message: 'محدودیت استفاده از این کد تخفیف به پایان رسیده است',
      }
    }
  }

  const perUserLimit = coupon.perUserLimit ?? 1
  const userUsed = await payload.count({
    collection: 'orders',
    where: {
      and: [
        { coupon: { equals: coupon.id } },
        { user: { equals: opts.userId } },
        { status: { equals: 'completed' } },
      ],
    },
    overrideAccess: true,
  })
  if (userUsed.totalDocs >= perUserLimit) {
    return { valid: false, message: 'شما قبلاً از این کد تخفیف استفاده کرده‌اید' }
  }

  const originalAmount = opts.coursePrice
  const finalAmount = calculateDiscountPrice(coupon.type, coupon.value, originalAmount)
  const discountAmount = calculateDiscountAmount(coupon.type, coupon.value, originalAmount)

  return {
    valid: true,
    coupon,
    originalAmount,
    discountAmount,
    finalAmount,
  }
}