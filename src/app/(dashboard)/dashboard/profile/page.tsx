'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user, loading: authLoading, refetch } = useAuth()
  const [name, setName] = useState('')
  const [nameInitialized, setNameInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Initialize name from user data
  if (user && !nameInitialized) {
    setName(user.name || '')
    setNameInitialized(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      setSuccess(true)
      refetch()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('خطا در ذخیره اطلاعات')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-siavash font-bold text-white mb-1">
          پروفایل
        </h1>
        <p className="text-gray-400 font-vazir text-sm">
          اطلاعات حساب کاربری خود را مدیریت کنید
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-vazir text-gray-300 mb-2">
              <User size={16} className="text-gray-500" />
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all duration-300 font-vazir"
            />
          </div>

          {/* Phone field (read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-vazir text-gray-300 mb-2">
              <Phone size={16} className="text-gray-500" />
              شماره موبایل
            </label>
            <input
              type="text"
              value={user.phone}
              readOnly
              dir="ltr"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-400 font-vazir cursor-not-allowed"
            />
            <p className="text-xs font-vazir text-gray-600 mt-1.5">
              شماره موبایل قابل تغییر نیست
            </p>
          </div>

          {/* Role display */}
          <div>
            <label className="text-sm font-vazir text-gray-300 mb-2 block">
              نقش
            </label>
            <div className="px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <span className="font-vazir text-gray-400">
                {user.role === 'admin' ? 'مدیر' : 'دانشجو'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm font-vazir"
            >
              {error}
            </motion.p>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm font-vazir"
            >
              <CheckCircle2 size={16} />
              اطلاعات با موفقیت ذخیره شد
            </motion.div>
          )}

          {/* Save button */}
          <motion.button
            type="submit"
            disabled={saving || name === (user.name || '')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 font-vazir font-medium text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={16} />
                ذخیره تغییرات
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
