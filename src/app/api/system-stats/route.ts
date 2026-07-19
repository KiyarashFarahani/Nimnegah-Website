import fs from 'fs'
import { NextResponse } from 'next/server'
import os from 'os'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jwtVerify } from 'jose'
import redis from '@/lib/redis'

function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const cpus = os.cpus()
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0)
    const totalTick = cpus.reduce(
      (acc, cpu) =>
        acc +
        cpu.times.user +
        cpu.times.nice +
        cpu.times.sys +
        cpu.times.idle +
        cpu.times.irq,
      0,
    )
    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length
    resolve(Math.round(((total - idle) / total) * 100))
  })
}

function getDiskUsage() {
  try {
    const stats = fs.statfsSync('/')
    const totalBytes = stats.blocks * stats.bsize
    const availableBytes = stats.bavail * stats.bsize
    const usedBytes = totalBytes - availableBytes
    const percent = Math.round((usedBytes / totalBytes) * 100)
    return {
      total: formatBytes(totalBytes),
      used: formatBytes(usedBytes),
      available: formatBytes(availableBytes),
      percent: `${percent}%`,
    }
  } catch {
    return null
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return parts.join(' ')
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })

  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/payload-token=([^;]+)/)
  const token = tokenMatch?.[1]

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(payload.secret)
    const { payload: decoded } = await jwtVerify<{
      collection: string
      id: string
    }>(token, secret)

    const user = await payload.findByID({
      collection: decoded.collection as 'users',
      id: decoded.id,
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cpuUsage = await getCpuUsage()
    const cpus = os.cpus()

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    const disk = getDiskUsage()

    const uptime = os.uptime()
    const loadAvg = os.loadavg()

    const processMem = process.memoryUsage()

    const [users, courses, lessons, orders, enrollments] = await Promise.all([
      payload.count({ collection: 'users' }),
      payload.count({ collection: 'courses' }),
      payload.count({ collection: 'lessons' }),
      payload.count({ collection: 'orders' }),
      payload.count({ collection: 'enrollments' }),
    ])

    let redisStats: {
      connectedClients: string
      usedMemory: string
      totalKeys: string
    } | null = null
    try {
      const info = await redis.info()
      const connectedClients =
        info.match(/connected_clients:(\d+)/)?.[1] ?? 'N/A'
      const usedMemoryBytes = info.match(/used_memory:(\d+)/)?.[1]
      const usedMemory = usedMemoryBytes
        ? formatBytes(parseInt(usedMemoryBytes))
        : 'N/A'
      const dbSize = await redis.dbsize()
      redisStats = {
        connectedClients,
        usedMemory,
        totalKeys: dbSize.toString(),
      }
    } catch {
      redisStats = null
    }

    let dbStats: { totalConnections: string; activeConnections: string } | null =
      null
    try {
      const pool = (payload.db as unknown as Record<string, unknown>).pool as Record<string, number> | undefined
      if (pool) {
        dbStats = {
          totalConnections: pool.totalCount?.toString() ?? 'N/A',
          activeConnections: pool.activeCount?.toString() ?? 'N/A',
        }
      }
    } catch {
      dbStats = null
    }

    return NextResponse.json({
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        model: cpus[0]?.model ?? 'Unknown',
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: Math.round((usedMem / totalMem) * 100),
      },
      disk,
      uptime: formatUptime(uptime),
      uptimeSeconds: uptime,
      loadAverage: loadAvg.map((l) => l.toFixed(2)),
      process: {
        heapUsed: formatBytes(processMem.heapUsed),
        heapTotal: formatBytes(processMem.heapTotal),
        rss: formatBytes(processMem.rss),
        external: formatBytes(processMem.external),
      },
      collections: {
        users: users.totalDocs,
        courses: courses.totalDocs,
        lessons: lessons.totalDocs,
        orders: orders.totalDocs,
        enrollments: enrollments.totalDocs,
      },
      redis: redisStats,
      database: dbStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('System stats error:', error)
    return NextResponse.json(
      { error: 'Failed to collect system stats' },
      { status: 500 },
    )
  }
}
