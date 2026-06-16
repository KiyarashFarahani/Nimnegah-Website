'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyForm() {
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const router = useRouter()

  useEffect(() => {
    if (!phone) {
      router.replace('/login')
      return
    }
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [phone, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    setError('')

    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      setResendTimer(60)
    } catch {
      setError('Failed to resend')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2">تأیید کد</h1>
      <p className="text-white/50 mb-8">
        کد ۶ رقمی ارسال شده به <span className="text-white" dir="ltr">{phone}</span> را وارد کنید
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            dir="ltr"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'تأیید...' : 'ورود'}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resendTimer > 0}
        className="w-full mt-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-30"
      >
        {resendTimer > 0
          ? `ارسال مجدد کد (${resendTimer}s)`
          : 'ارسال مجدد کد'}
      </button>

      <button
        onClick={() => router.replace('/login')}
        className="w-full py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
      >
        تغییر شماره موبایل
      </button>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-white/50">Loading...</p>}>
        <VerifyForm />
      </Suspense>
    </main>
  )
}
