'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  File,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Lock,
  Clock,
} from 'lucide-react'
import { getPlainText } from '@/lib/course-utils'
import { formatFileSize, type ProductFile } from '@/lib/product-utils'

type Product = {
  id: number
  title: string
  slug: string
  description?: unknown
  thumbnail?: { url: string } | null
  files: ProductFile[]
}

type Purchase = {
  id: number
  purchasedAt: string
}

type FileLinkState = {
  url: string
  expiresAt: string
  loading: boolean
  error?: string
}

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'منقضی شده'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours.toLocaleString('fa-IR')}:${minutes.toLocaleString('fa-IR').padStart(2, '۰')}:${seconds.toLocaleString('fa-IR').padStart(2, '۰')}`
  }
  return `${minutes.toLocaleString('fa-IR')}:${seconds.toLocaleString('fa-IR').padStart(2, '۰')}`
}

function FileRow({
  file,
  productId,
  index,
  isLast,
}: {
  file: ProductFile
  productId: number
  index: number
  isLast: boolean
}) {
  const [state, setState] = useState<FileLinkState | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')
  const [, forceTick] = useState(0)

  useEffect(() => setOrigin(window.location.origin), [])

  useEffect(() => {
    if (!state?.expiresAt) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [state?.expiresAt])

  const generate = useCallback(async () => {
    setState((prev) => ({ url: prev?.url ?? '', expiresAt: prev?.expiresAt ?? '', loading: true }))
    try {
      const res = await fetch('/api/download/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, fileId: file.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState({ url: '', expiresAt: '', loading: false, error: data.error || 'خطا در ساخت لینک' })
        return
      }
      setState({ url: data.url, expiresAt: data.expiresAt, loading: false })
    } catch {
      setState({ url: '', expiresAt: '', loading: false, error: 'خطا در ارتباط با سرور' })
    }
  }, [productId, file.id])

  async function copyLink() {
    if (!state?.url) return
    try {
      const absolute = `${window.location.origin}${state.url}`
      await navigator.clipboard.writeText(absolute)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const expired = state?.expiresAt ? new Date(state.expiresAt).getTime() <= Date.now() : false
  const absoluteUrl = state?.url
    ? origin ? new URL(state.url, origin).href : state.url
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 sm:p-5 ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <File size={18} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-vazir text-white break-all" dir="ltr" style={{ textAlign: 'right' }}>
            {file.filename}
          </p>
          {file.filesize != null && file.filesize > 0 && (
            <p className="text-xs font-vazir text-gray-500 mt-0.5" dir="ltr" style={{ textAlign: 'right' }}>
              {formatFileSize(file.filesize)}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={generate}
          disabled={state?.loading}
          className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-vazir font-medium text-white bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-60 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] min-h-[40px]"
        >
          {state?.loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          ساخت لینک
        </motion.button>
      </div>

      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs font-vazir text-red-400"
          >
            {state.error}
          </motion.p>
        )}
        {state?.url && !state.loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-vazir text-gray-400">
                <Clock size={12} className={expired ? 'text-red-400' : 'text-green-400'} />
                {expired ? (
                  <span className="text-red-400">لینک منقضی شده — لینک جدید بسازید</span>
                ) : (
                  <>
                    اعتبار لینک:
                    <span className="text-white font-medium" dir="ltr">
                      {formatRemaining(state.expiresAt)}
                    </span>
                  </>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={generate}
                  disabled={state.loading}
                  aria-label="ساخت لینک جدید"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="ساخت لینک جدید"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <a
                href={absoluteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 break-all text-xs font-vazir text-blue-300 hover:text-blue-200 underline underline-offset-2"
              >
                {absoluteUrl}
              </a>
              <button
                onClick={copyLink}
                aria-label="کپی لینک دانلود"
                className="shrink-0 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="کپی لینک"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] font-vazir text-gray-500 leading-relaxed">
              این لینک اختصاصی شماست و تا زمان اعتبارش قابل استفاده است؛ آن را در اختیار دیگران قرار ندهید.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="h-7 sm:h-8 w-48 bg-white/10 rounded animate-pulse" />
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="h-40 sm:h-52 bg-white/5 animate-pulse" />
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock size={28} className="text-gray-500" />
      </div>
      <h2 className="text-xl font-siavash font-bold text-white mb-2">دسترسی غیرمجاز</h2>
      <p className="text-gray-400 font-vazir text-sm mb-6">{message}</p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-vazir text-sm transition-all duration-300"
      >
        بازگشت به داشبورد
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default function ProductFilesView({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/dashboard/products/${slug}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error === 'Not purchased' ? 'شما این محصول را خریداری نکرده‌اید' : 'خطا در بارگذاری محصول')
          return
        }
        setProduct(data.product)
        setPurchase(data.purchase)
      })
      .catch(() => setError('خطا در ارتباط با سرور'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSkeleton />
  if (error || !product) return <ErrorState message={error || 'محصول یافت نشد'} />

  const description = getPlainText(product.description as never) || 'توضیحاتی ثبت نشده'
  const thumbnailUrl = product.thumbnail?.url
  const files = product.files ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 text-sm font-vazir text-gray-500"
      >
        <Link href="/dashboard" className="hover:text-white transition-colors">
          داشبورد
        </Link>
        <span>/</span>
        <span className="text-white">{product.title}</span>
      </motion.div>

      {/* Product card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Thumbnail + title */}
        <div className="relative">
          <div className="relative h-36 sm:h-44 overflow-hidden">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={product.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 right-0 left-0 p-5">
            <h1 className="text-2xl font-siavash font-bold text-white mb-1">
              {product.title}
            </h1>
            <p className="text-sm font-vazir text-gray-400 line-clamp-1">{description}</p>
          </div>
        </div>

        {/* Purchase info */}
        {purchase?.purchasedAt && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2 text-xs font-vazir text-gray-500">
            <Check size={12} className="text-green-400" />
            خریداری شده در{' '}
            {new Date(purchase.purchasedAt).toLocaleDateString('fa-IR')}
          </div>
        )}

        {/* Files list */}
        <div className="border-t border-white/5">
          <div className="px-5 py-4 flex items-center justify-between">
            <h2 className="text-lg font-siavash font-bold text-white">فایل‌های قابل دانلود</h2>
            <span className="text-xs font-vazir text-gray-500">
              {files.length.toLocaleString('fa-IR')} فایل
            </span>
          </div>

          {files.length === 0 ? (
            <div className="p-8 text-center border-t border-white/5">
              <p className="text-gray-400 font-vazir text-sm">
                فایلی برای این محصول ثبت نشده است. لطفاً با پشتیبانی تماس بگیرید.
              </p>
            </div>
          ) : (
            <div className="border-t border-white/5">
              {files.map((file, i) => (
                <FileRow
                  key={file.id}
                  file={file}
                  productId={product.id}
                  index={i}
                  isLast={i === files.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
