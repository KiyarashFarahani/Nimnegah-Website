import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(request: Request) {
  try {
    const result = await authenticateRequest(request)

    if (!result.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: result.status })
    }

    const body = await request.json()
    const { name } = body

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const updated = await payload.update({
      collection: 'users',
      id: result.user.id,
      data: { name: name.trim() },
    })

    return NextResponse.json({
      user: { id: updated.id, phone: updated.phone, name: updated.name, role: updated.role },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
