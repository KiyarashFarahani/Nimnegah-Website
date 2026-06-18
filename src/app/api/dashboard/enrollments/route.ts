import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    const authResult = await payload.auth({ headers: request.headers })
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enrollments = await payload.find({
      collection: 'enrollments',
      depth: 2,
      where: {
        user: { equals: authResult.user.id },
      },
      sort: '-lastAccessedAt',
    })

    return NextResponse.json({ enrollments: enrollments.docs })
  } catch (error) {
    console.error('Enrollments fetch error:', error)
    return NextResponse.json({ enrollments: [] }, { status: 500 })
  }
}
