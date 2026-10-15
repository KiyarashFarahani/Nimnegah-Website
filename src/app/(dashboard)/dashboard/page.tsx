'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowLeft, Key, Paperclip } from 'lucide-react'
import { Course, formatDuration, getPlainText } from '@/lib/course-utils'
import { Product } from '@/lib/product-utils'

type Enrollment = {
  id: string | number
  course: Course
  progress: number
  enrolledAt: string
  lastAccessedAt?: string
  completedLessons?: Array<{ lessonId: number; completedAt: string }>
  spotplayerLicenseKey?: string
}

type Purchase = {
  id: string | number
  product: Product
  purchasedAt: string
}

function EnrolledCourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const course = enrollment.course
  const description = getPlainText(course.description) || 'توضیحاتی ثبت نشده'
  const thumbnailUrl = course.thumbnail?.url
  const categoryName = course.category?.name
  const isSpotPlayer = course.courseType === 'spotplayer'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <Link href={`/dashboard/learn/${course.slug}`} className="block h-full">
        <div className="h-full bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-36 sm:h-44 overflow-hidden shrink-0">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />

            {/* Badge */}
            {isSpotPlayer && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full flex items-center gap-1">
                <Key size={10} className="text-white" />
                <span className="text-xs font-vazir text-white">اسپات‌پلیر</span>
              </div>
            )}


          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex flex-col flex-1">
            {categoryName && (
              <span className="text-xs font-vazir text-blue-300 mb-1 block">
                {categoryName}
              </span>
            )}
            <h3 className="text-lg font-siavash font-bold text-white group-hover:text-blue-300 transition-colors duration-300 mb-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-400 font-vazir line-clamp-2 mb-4 flex-1">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-vazir">
                {course.duration != null && course.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(course.duration)}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-blue-400 font-vazir group-hover:text-blue-300 transition-colors">
                {isSpotPlayer ? 'مشاهده لایسنس' : 'ادامه'}
                <ArrowLeft size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function PurchasedProductCard({ purchase, index }: { purchase: Purchase; index: number }) {
  const product = purchase.product
  const description = getPlainText(product.description) || 'توضیحاتی ثبت نشده'
  const thumbnailUrl = product.thumbnail?.url
  const categoryName = product.category?.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <Link href={`/dashboard/products/${product.slug}`} className="block h-full">
        <div className="h-full bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-36 sm:h-44 overflow-hidden shrink-0">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent" />

            <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full flex items-center gap-1">
              <Paperclip size={10} className="text-white" />
              <span className="text-xs font-vazir text-white">فایل</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex flex-col flex-1">
            {categoryName && (
              <span className="text-xs font-vazir text-blue-300 mb-1 block">
                {categoryName}
              </span>
            )}
            <h3 className="text-lg font-siavash font-bold text-white group-hover:text-blue-300 transition-colors duration-300 mb-2">
              {product.title}
            </h3>
            <p className="text-sm text-gray-400 font-vazir line-clamp-2 mb-4 flex-1">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-gray-500 font-vazir">
                خریداری شده
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-400 font-vazir group-hover:text-blue-300 transition-colors">
                دانلود فایل‌ها
                <ArrowLeft size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="h-7 sm:h-8 w-40 sm:w-48 bg-white/10 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-36 sm:h-44 bg-white/10" />
            <div className="p-4 sm:p-5 space-y-3">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-1.5 w-full bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/enrollments').then((res) => res.json()),
      fetch('/api/dashboard/purchases').then((res) => res.json()),
    ])
      .then(([enrollmentsData, purchasesData]) => {
        setEnrollments(enrollmentsData.enrollments || [])
        setPurchases(purchasesData.purchases || [])
      })
      .catch(() => {
        setEnrollments([])
        setPurchases([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  const hasAny = enrollments.length > 0 || purchases.length > 0

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Courses and products */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl font-siavash font-bold text-white mb-1">
            دوره‌ها و محصولات من
          </h1>
          <p className="text-gray-400 font-vazir text-sm">
            {enrollments.length > 0
              ? `${enrollments.length.toLocaleString('fa-IR')} دوره در حال یادگیری`
              : 'دوره هایی که خریداری کردم'}
          </p>
        </motion.div>

        {enrollments.length === 0 ? (
          <div className="text-center py-8 sm:py-12 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-400 font-vazir text-sm mb-4">
              هنوز در دوره‌ای ثبت‌نام نکرده‌اید
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 font-vazir font-medium text-sm transition-all duration-300"
            >
              مشاهده دوره‌ها
              <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {enrollments.map((enrollment, index) => (
              <EnrolledCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Products section */}
      <div id="products" className="scroll-mt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h2 className="text-2xl font-siavash font-bold text-white mb-1">
              محصولات من
            </h2>
            <p className="text-gray-400 font-vazir text-sm">
              {purchases.length > 0
                ? `${purchases.length.toLocaleString('fa-IR')} محصول خریداری شده`
                : 'فایل‌هایی که خریداری کردم'}
            </p>
          </motion.div>

          {purchases.length === 0 && enrollments.length > 0 && (
            <div className="text-center py-8 sm:py-12 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-400 font-vazir text-sm mb-4">
                هنوز محصولی خریداری نکرده‌اید
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 font-vazir font-medium text-sm transition-all duration-300"
              >
                مشاهده محصولات
                <ArrowLeft size={16} />
              </Link>
            </div>
          )}
          {purchases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {purchases.map((purchase, index) => (
                <PurchasedProductCard
                  key={purchase.id}
                  purchase={purchase}
                  index={index}
                />
              ))}
            </div>
          )}
      </div>

      {/* Full empty state (no courses AND no products) */}
      {!hasAny && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <BookOpen size={28} className="text-gray-500 sm:hidden" />
            <BookOpen size={32} className="text-gray-500 hidden sm:block" />
          </div>
          <h2 className="text-xl sm:text-2xl font-siavash font-bold text-white mb-2 sm:mb-3">
            هنوز چیزی خریداری نکرده‌اید
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-vazir mb-6 sm:mb-8 max-w-md mx-auto">
            برای شروع، در دوره‌ها یا محصولات دیجیتال مورد علاقه خود ثبت‌نام کنید
          </p>
        </motion.div>
      )}
    </div>
  )
}
