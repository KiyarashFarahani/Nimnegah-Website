'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'

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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 w-full max-w-md"
    >
      {/* Glass card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-slate-500/20 rounded-2xl border border-white/10">
            <ShieldCheck size={28} className="text-blue-400" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-siavash font-bold text-white mb-3">
            تأیید کد
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-slate-400 to-slate-500 mx-auto mb-4 rounded-full" />
          <p className="text-gray-400 font-vazir leading-relaxed">
            کد ۶ رقمی ارسال شده به{' '}
            <span className="text-white" dir="ltr">{phone}</span>{' '}
            را وارد کنید
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              dir="ltr"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/[0.07] transition-all duration-300 font-vazir"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm font-vazir text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || code.length < 6}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-vazir font-semibold text-lg rounded-2xl shadow-lg hover:shadow-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                تأیید...
              </>
            ) : (
              <>
                ورود
                <ArrowLeft size={18} />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Resend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-5 text-center"
        >
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-sm text-gray-500 hover:text-gray-300 font-vazir transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {resendTimer > 0
              ? `ارسال مجدد کد (${resendTimer}s)`
              : 'ارسال مجدد کد'}
          </button>
        </motion.div>

        {/* Change number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3 text-center"
        >
          <button
            onClick={() => router.replace('/login')}
            className="text-sm text-gray-500 hover:text-gray-300 font-vazir transition-colors duration-300"
          >
            تغییر شماره موبایل
          </button>
        </motion.div>
      </div>

      {/* Back to home */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-6 text-center"
      >
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 font-vazir transition-colors duration-300"
        >
          بازگشت به صفحه اصلی
          <ArrowLeft size={14} />
        </a>
      </motion.div>
    </motion.div>
  )
}

export default function VerifyPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-400/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/10 via-blue-400/10 to-indigo-500/10 rounded-full blur-3xl"
      />

      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-sm" />
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-white/5 rounded-full blur-sm" />

      <Suspense fallback={<p className="text-white/50">Loading...</p>}>
        <VerifyForm />
      </Suspense>
    </main>
  )
}
