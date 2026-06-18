'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type User = {
  id: number
  phone: string
  name: string
  role: string
}

type UseAuthOptions = {
  redirectTo?: string
  redirectIfEmptyName?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', redirectIfEmptyName = false } = options
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user) {
        router.replace(redirectTo)
        return
      }
      setUser(data.user)
      if (redirectIfEmptyName && !data.user.name) {
        router.replace('/complete-profile')
      }
    } catch {
      router.replace(redirectTo)
    } finally {
      setLoading(false)
    }
  }, [router, redirectTo, redirectIfEmptyName])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }, [router])

  return { user, loading, logout, refetch: fetchUser }
}
