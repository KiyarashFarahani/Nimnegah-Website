import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import { resolveDiscountCoupon } from '@/lib/discount'
import { checkDiscountRateLimit } from '@/lib/redis'

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const rateCheck = await checkDiscountRateLimit(getClientIp(request))
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' },
        { status: 429 },
      )
    }

    const payload = await getPayload({ config })
    const { code, courseId } = await request.json()

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { valid: false, message: 'کد تخفیف معتبر نیست' },
        { status: 200 },
      )
    }

    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
    }

    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 0,
    })

    if (!course || course.status !== 'published') {
      return NextResponse.json(
        { valid: false, message: 'دوره مورد نظر برای استفاده از کد تخفیف معتبر نیست' },
        { status: 200 },
      )
    }

    const coursePrice = typeof course.price === 'number' ? course.price : 0
    if (coursePrice <= 0) {
      return NextResponse.json(
        { valid: false, message: 'این دوره رایگان است و نیازی به کد تخفیف ندارد' },
        { status: 200 },
      )
    }

    const result = await resolveDiscountCoupon(payload, {
      code,
      courseId: course.id,
      coursePrice,
      userId: auth.user.id,
    })

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, message: result.message },
        { status: 200 },
      )
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    })
  } catch (error) {
    console.error('Discount validate error:', error)
    return NextResponse.json(
      { error: 'خطا در بررسی کد تخفیف' },
      { status: 500 },
    )
  }
}