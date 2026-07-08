import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import redis from '@/lib/redis'

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number }> = {}
  let healthy = true

  // Database check
  try {
    const start = Date.now()
    const payload = await getPayload({ config })
    await payload.find({ collection: 'users', limit: 1 })
    checks.database = { status: 'ok', latencyMs: Date.now() - start }
  } catch {
    checks.database = { status: 'error' }
    healthy = false
  }

  // Redis check
  try {
    const start = Date.now()
    await redis.ping()
    checks.redis = { status: 'ok', latencyMs: Date.now() - start }
  } catch {
    checks.redis = { status: 'error' }
    healthy = false
  }

  const status = healthy ? 200 : 503

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status },
  )
}
