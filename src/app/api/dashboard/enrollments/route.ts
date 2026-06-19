import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payload = await getPayload({ config })

    const enrollments = await payload.find({
      collection: 'enrollments',
      depth: 2,
      where: {
        user: { equals: auth.user.id },
      },
      sort: '-lastAccessedAt',
    })

    return NextResponse.json({ enrollments: enrollments.docs })
  } catch (error) {
    console.error('Enrollments fetch error:', error)
    return NextResponse.json({ enrollments: [] }, { status: 500 })
  }
}
