import { describe, it, expect, vi } from 'vitest'
import type { Payload, PayloadRequest } from 'payload'
import {
  normalizeCouponCode,
  calculateDiscountPrice,
  calculateDiscountAmount,
  paymentReservationCutoff,
  resolveDiscountCoupon,
} from '../discount'

describe('normalizeCouponCode', () => {
  it('trims and uppercases a code', () => {
    expect(normalizeCouponCode('  summer20  ')).toBe('SUMMER20')
  })

  it('handles already normalized codes', () => {
    expect(normalizeCouponCode('NOWROOZ')).toBe('NOWROOZ')
  })

  it('handles empty string', () => {
    expect(normalizeCouponCode('')).toBe('')
  })
})

describe('calculateDiscountPrice — percent', () => {
  it('applies a 20% discount', () => {
    expect(calculateDiscountPrice('percent', 20, 1000000)).toBe(800000)
  })

  it('applies a 50% discount', () => {
    expect(calculateDiscountPrice('percent', 50, 1000000)).toBe(500000)
  })

  it('floors fractional results', () => {
    expect(calculateDiscountPrice('percent', 33, 1000000)).toBe(670000)
  })

  it('clamps percent above 100 to free', () => {
    expect(calculateDiscountPrice('percent', 150, 1000000)).toBe(0)
  })

  it('returns 0 for a 100% discount', () => {
    expect(calculateDiscountPrice('percent', 100, 1000000)).toBe(0)
  })

  it('handles zero price', () => {
    expect(calculateDiscountPrice('percent', 20, 0)).toBe(0)
  })
})

describe('calculateDiscountPrice — fixed', () => {
  it('subtracts a fixed amount', () => {
    expect(calculateDiscountPrice('fixed', 200000, 1000000)).toBe(800000)
  })

  it('never goes below zero', () => {
    expect(calculateDiscountPrice('fixed', 1500000, 1000000)).toBe(0)
  })

  it('handles exact match to zero', () => {
    expect(calculateDiscountPrice('fixed', 1000000, 1000000)).toBe(0)
  })

  it('ignores negative value', () => {
    expect(calculateDiscountPrice('fixed', -100, 1000000)).toBe(1000000)
  })
})

describe('calculateDiscountAmount', () => {
  it('computes discount amount for percent', () => {
    expect(calculateDiscountAmount('percent', 20, 1000000)).toBe(200000)
  })

  it('computes discount amount for fixed', () => {
    expect(calculateDiscountAmount('fixed', 200000, 1000000)).toBe(200000)
  })

  it('caps discount at the full price', () => {
    expect(calculateDiscountAmount('fixed', 2000000, 1000000)).toBe(1000000)
  })

  it('returns 0 for zero price', () => {
    expect(calculateDiscountAmount('percent', 50, 0)).toBe(0)
  })

  it('is consistent with final price', () => {
    const price = 1250000
    const type = 'percent' as const
    const value = 25
    expect(
      price -
        calculateDiscountAmount(type, value, price),
    ).toBe(calculateDiscountPrice(type, value, price))
  })
})

describe('resolveDiscountCoupon', () => {
  it('counts pending orders as reserved uses inside the transaction', async () => {
    const req = {} as PayloadRequest
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [{
          id: 1,
          code: 'SAVE10',
          type: 'percent',
          value: 10,
          status: 'active',
          scope: 'all',
          maxUses: 5,
          perUserLimit: 1,
        }],
      }),
      count,
    } as unknown as Payload

    const result = await resolveDiscountCoupon(payload, {
      code: 'SAVE10',
      courseId: 1,
      coursePrice: 100000,
      userId: 1,
    }, req)

    expect(result.valid).toBe(true)
    expect(count).toHaveBeenCalledTimes(2)
    for (const [call] of count.mock.calls) {
      expect(call.req).toBe(req)
      expect(call.where.and).toContainEqual(expect.objectContaining({
        or: expect.arrayContaining([
          { status: { equals: 'completed' } },
          expect.objectContaining({ and: expect.any(Array) }),
        ]),
      }))
    }
  })

  it('uses a bounded pending-order reservation window', () => {
    expect(paymentReservationCutoff(1_800_000)).toBe(new Date(0).toISOString())
  })
})
