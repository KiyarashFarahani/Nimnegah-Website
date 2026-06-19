'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react'

const REASONS: Record<string, { title: string; description: string }> = {
  cancelled: {
    title: 'پرداخت لغو شد',
    description: 'شما پرداخت را لغو کردید. نگران نباشید، هیچ مبلغی از حساب شما کسر نشده است.',
  },
  payment_failed: {
    title: 'پرداخت ناموفق بود',
    description: 'متأسفانه پرداخت شما توسط بانک تأیید نشد. لطفاً دوباره تلاش کنید.',
  },
  verify_failed: {
    title: 'تأیید پرداخت ناموفق',
    description: 'پرداخت انجام شد اما تأیید آن با مشکل مواجه شد. نگران نباشید، در صورت کسر مبلغ، به‌طور خودکار بازگشت داده می‌شود.',
  },
  order_not_found: {
    title: 'سفارش یافت نشد',
    description: 'سفارش مورد نظر در سیستم یافت نشد. لطفاً دوباره تلاش کنید.',
  },
  server_error: {
    title: 'خطای سرور',
    description: 'مشکلی در سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید.',
  },
}

function FailedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'payment_failed'
  const info = REASONS[reason] || REASONS.payment_failed

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950 flex items-center justify-center px-4">
      {/* Background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-400/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-10 text-center">
          {/* Error Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full border border-red-500/30">
              <XCircle size={40} className="text-red-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl font-siavash font-bold text-white mb-3">
              {info.title}
            </h1>
            <p className="text-gray-400 font-vazir leading-relaxed mb-8">
              {info.description}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-3"
          >
            <Link
              href="/courses"
              className="w-full py-3.5 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.65)] flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              تلاش مجدد
            </Link>

            <Link
              href="/"
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              بازگشت به صفحه اصلی
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950 flex items-center justify-center">
          <p className="text-white/50 font-vazir">در حال بارگذاری...</p>
        </div>
      }>
        <FailedContent />
      </Suspense>
    </main>
  )
}
