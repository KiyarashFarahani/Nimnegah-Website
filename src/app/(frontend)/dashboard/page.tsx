'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  phone: string
  name: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.replace('/login')
          return
        }
        setUser(data.user)
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">داشبورد</h1>
        <p className="text-white/50 mb-8">
          خوش آمدید{user.name ? `، ${user.name}` : ''}
        </p>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <p className="text-sm text-white/40 mb-1">شماره موبایل</p>
          <p className="text-white" dir="ltr">{user.phone}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <p className="text-sm text-white/40 mb-1">نقش</p>
          <p className="text-white">{user.role === 'admin' ? 'مدیر' : 'دانشجو'}</p>
        </div>

        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.replace('/login')
          }}
          className="w-full py-3 border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
        >
          خروج
        </button>
      </div>
    </main>
  )
}
