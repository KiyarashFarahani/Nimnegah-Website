'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ArrowRight, Copy } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const courseSlug = searchParams.get('course')
  const refId = searchParams.get('refId')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950 flex items-center justify-center px-4">
      {/* Background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-400/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full border border-green-500/30">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl font-siavash font-bold text-white mb-3">
              پرداخت موفق
            </h1>
            <p className="text-gray-400 font-vazir leading-relaxed mb-6">
              خرید شما با موفقیت انجام شد. حالا می‌توانید دوره را در داشبورد خود مشاهده کنید.
            </p>
          </motion.div>

          {/* Ref ID */}
          {refId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl"
            >
              <p className="text-xs text-gray-500 font-vazir mb-2">شماره پیگیری</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-vazir text-white" dir="ltr">{refId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(refId)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="کپی"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-3"
          >
            {courseSlug && (
              <Link
                href={`/dashboard/learn/${courseSlug}`}
                className="w-full py-3.5 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.65)] flex items-center justify-center gap-2"
              >
                شروع یادگیری
                <ArrowRight size={16} />
              </Link>
            )}

            <Link
              href="/dashboard"
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              رفتن به داشبورد
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Back to courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 text-center"
        >
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 font-vazir transition-colors duration-300"
          >
            مشاهده دوره‌های دیگر
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950 flex items-center justify-center">
          <p className="text-white/50 font-vazir">در حال بارگذاری...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
