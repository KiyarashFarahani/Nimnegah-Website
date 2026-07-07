'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowLeft, Key } from 'lucide-react'
import type { SerializedEditorState } from 'lexical'

type Course = {
  id: string | number
  title: string
  slug: string
  description?: SerializedEditorState
  price: number
  duration?: number
  level?: string
  courseType?: 'self-hosted' | 'spotplayer'
  thumbnail?: { url: string } | null
  category?: { name: string } | null
}

type Enrollment = {
  id: string | number
  course: Course
  progress: number
  enrolledAt: string
  lastAccessedAt?: string
  completedLessons?: Array<{ lessonId: number; completedAt: string }>
  spotplayerLicenseKey?: string
}

const LEVEL_MAP: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remaining = minutes % 60
    return remaining > 0 ? `${hours} ساعت و ${remaining} دقیقه` : `${hours} ساعت`
  }
  return `${minutes} دقیقه`
}

function getPlainText(richText?: SerializedEditorState): string {
  if (!richText?.root?.children) return ''
  type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }
  const extractText = (nodes: LexicalNode[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractText(node.children)
        return ''
      })
      .join(' ')
  }
  return extractText(richText.root.children as LexicalNode[]).trim()
}

function EnrolledCourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const course = enrollment.course
  const description = getPlainText(course.description) || 'توضیحاتی ثبت نشده'
  const thumbnailUrl = course.thumbnail?.url
  const categoryName = course.category?.name
  const levelLabel = course.level ? LEVEL_MAP[course.level] || course.level : ''
  const completedCount = enrollment.completedLessons?.length || 0
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
          <div className="relative h-44 overflow-hidden shrink-0">
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
            <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full flex items-center gap-1">
              {isSpotPlayer ? (
                <>
                  <Key size={10} className="text-white" />
                  <span className="text-xs font-vazir text-white">اسپات‌پلیر</span>
                </>
              ) : (
                <span className="text-xs font-vazir text-white">
                  {enrollment.progress}٪ تکمیل
                </span>
              )}
            </div>

            {levelLabel && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                <span className="text-xs font-vazir text-white/90">{levelLabel}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
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

            {/* Progress bar - only for self-hosted */}
            {!isSpotPlayer && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-vazir text-gray-500">پیشرفت</span>
                  <span className="text-xs font-vazir text-blue-400">
                    {completedCount} درس تکمیل شده
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${enrollment.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                    className="h-full bg-gradient-to-l from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            )}

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

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen size={32} className="text-gray-500" />
      </div>
      <h2 className="text-2xl font-siavash font-bold text-white mb-3">
        هنوز در دوره‌ای ثبت‌نام نکرده‌اید
      </h2>
      <p className="text-gray-400 font-vazir mb-8 max-w-md mx-auto">
        برای شروع یادگیری، ابتدا در دوره‌های مورد علاقه خود ثبت‌نام کنید
      </p>
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 font-vazir font-medium text-sm transition-all duration-300"
      >
        مشاهده دوره‌ها
        <ArrowLeft size={16} />
      </Link>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-44 bg-white/10" />
            <div className="p-5 space-y-3">
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/enrollments')
      .then((res) => res.json())
      .then((data) => setEnrollments(data.enrollments || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-siavash font-bold text-white mb-1">
          دوره‌های من
        </h1>
        <p className="text-gray-400 font-vazir text-sm">
          {enrollments.length > 0
            ? `${enrollments.length} دوره در حال یادگیری`
            : 'دوره‌های خریداری شده اینجا نمایش داده می‌شوند'}
        </p>
      </motion.div>

      {enrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
  )
}
