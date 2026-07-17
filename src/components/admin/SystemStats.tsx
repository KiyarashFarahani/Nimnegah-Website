'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type SystemStats = {
  cpu: { usage: number; cores: number; model: string }
  memory: { total: number; used: number; free: number; percentage: number }
  disk: { total: string; used: string; available: string; percent: string } | null
  uptime: string
  uptimeSeconds: number
  loadAverage: string[]
  process: { heapUsed: string; heapTotal: string; rss: string; external: string }
  collections: {
    users: number
    courses: number
    lessons: number
    orders: number
    enrollments: number
  }
  redis: { connectedClients: string; usedMemory: string; totalKeys: string } | null
  database: { totalConnections: string; activeConnections: string } | null
  timestamp: string
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--theme-elevation-100)',
        borderRadius: 'var(--style-radius-s)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.min(value, 100)}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 'var(--style-radius-s)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

function StatCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: 'var(--style-radius-l)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--theme-elevation-350)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
      }}
    >
      <span style={{ color: 'var(--theme-elevation-350)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--theme-text)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        {value}
      </span>
    </div>
  )
}

function getUsageColor(value: number): string {
  if (value < 60) return 'var(--theme-success-500)'
  if (value < 85) return 'var(--theme-warning-500)'
  return 'var(--theme-error-500)'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function SystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/system-stats', {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 403) return
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setStats(data)
      setError(null)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    }
  }, [])

  useEffect(() => {
    fetchStats()

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchStats, 10000)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchStats()
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchStats])

  if (error) {
    return (
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'var(--theme-error-50)',
          border: '1px solid var(--theme-error-200)',
          borderRadius: 'var(--style-radius-m)',
          color: 'var(--theme-error-600)',
          fontSize: '13px',
        }}
      >
        Failed to load system stats: {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div
        style={{
          marginTop: '24px',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--theme-elevation-350)',
          fontSize: '13px',
        }}
      >
        Loading system stats...
      </div>
    )
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-text)', margin: 0 }}>
          System Resources
        </h2>
        {lastUpdated && (
          <span style={{ fontSize: '11px', color: 'var(--theme-elevation-350)' }}>
            Last updated: {lastUpdated} · auto-refreshes every 10s
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard title="CPU">
          <div style={{ fontSize: '28px', fontWeight: 700, color: getUsageColor(stats.cpu.usage) }}>
            {stats.cpu.usage}%
          </div>
          <ProgressBar value={stats.cpu.usage} color={getUsageColor(stats.cpu.usage)} />
          <MetricRow label="Cores" value={`${stats.cpu.cores}`} />
          <MetricRow label="Load Avg" value={stats.loadAverage.join(' / ')} />
        </StatCard>

        <StatCard title="Memory">
          <div style={{ fontSize: '28px', fontWeight: 700, color: getUsageColor(stats.memory.percentage) }}>
            {stats.memory.percentage}%
          </div>
          <ProgressBar value={stats.memory.percentage} color={getUsageColor(stats.memory.percentage)} />
          <MetricRow label="Used" value={formatBytes(stats.memory.used)} />
          <MetricRow label="Total" value={formatBytes(stats.memory.total)} />
        </StatCard>

        {stats.disk && (
          <StatCard title="Disk">
            <div
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: getUsageColor(parseInt(stats.disk.percent)),
              }}
            >
              {stats.disk.percent}
            </div>
            <ProgressBar
              value={parseInt(stats.disk.percent)}
              color={getUsageColor(parseInt(stats.disk.percent))}
            />
            <MetricRow label="Used" value={stats.disk.used} />
            <MetricRow label="Total" value={stats.disk.total} />
            <MetricRow label="Available" value={stats.disk.available} />
          </StatCard>
        )}

        <StatCard title="Uptime">
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)' }}>
            {stats.uptime}
          </div>
          <MetricRow label="Uptime (seconds)" value={`${stats.uptimeSeconds}s`} />
        </StatCard>

        <StatCard title="Node.js Process">
          <MetricRow label="Heap Used" value={stats.process.heapUsed} />
          <MetricRow label="Heap Total" value={stats.process.heapTotal} />
          <MetricRow label="RSS" value={stats.process.rss} />
          <MetricRow label="External" value={stats.process.external} />
        </StatCard>

        <StatCard title="Database">
          {stats.database ? (
            <>
              <MetricRow label="Total Connections" value={stats.database.totalConnections} />
              <MetricRow label="Active Connections" value={stats.database.activeConnections} />
            </>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--theme-elevation-350)' }}>Unavailable</span>
          )}
          <div style={{ borderTop: '1px solid var(--theme-border-color)', paddingTop: '10px', marginTop: '4px' }}>
            <MetricRow label="Users" value={`${stats.collections.users}`} />
            <MetricRow label="Courses" value={`${stats.collections.courses}`} />
            <MetricRow label="Lessons" value={`${stats.collections.lessons}`} />
            <MetricRow label="Orders" value={`${stats.collections.orders}`} />
            <MetricRow label="Enrollments" value={`${stats.collections.enrollments}`} />
          </div>
        </StatCard>

        {stats.redis && (
          <StatCard title="Redis">
            <MetricRow label="Used Memory" value={stats.redis.usedMemory} />
            <MetricRow label="Connected Clients" value={stats.redis.connectedClients} />
            <MetricRow label="Total Keys" value={stats.redis.totalKeys} />
          </StatCard>
        )}
      </div>
    </div>
  )
}
