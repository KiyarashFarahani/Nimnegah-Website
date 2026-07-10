'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  CheckCircle2,
  Circle,
  ArrowRight,
  BookOpen,
  Clock,
  Loader2,
  AlertCircle,
  Key,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import VideoPlayer from '@/components/dashboard/VideoPlayer'
import { formatLessonDuration } from '@/lib/course-utils'

type Lesson = {
  id: string | number
  title: string
  description?: string
  duration: number
  order: number
  isFree: boolean
}

type Course = {
  id: string | number
  title: string
  slug: string
  duration?: number
  level?: string
  courseType?: 'self-hosted' | 'spotplayer'
}

type Enrollment = {
  id: string | number
  progress: number
  completedLessons?: Array<{ lessonId: number; completedAt: string }>
  spotplayerLicenseKey?: string
}

function NotEnrolledState() {
  return (
    <div className="text-center py-12 sm:py-20">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <AlertCircle size={28} className="text-gray-500 sm:hidden" />
        <AlertCircle size={32} className="text-gray-500 hidden sm:block" />
      </div>
      <h2 className="text-xl sm:text-2xl font-siavash font-bold text-white mb-2 sm:mb-3">
        دسترسی غیرمجاز
      </h2>
      <p className="text-sm sm:text-base text-gray-400 font-vazir mb-6 sm:mb-8">
        شما در این دوره ثبت‌نام نکرده‌اید
      </p>
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-vazir text-sm transition-all duration-300"
      >
        مشاهده دوره‌ها
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="text-blue-400 animate-spin" />
    </div>
  )
}

function SpotPlayerView({ course, enrollment }: { course: Course; enrollment: Enrollment }) {
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [licenseKey, setLicenseKey] = useState(enrollment.spotplayerLicenseKey)
  const [error, setError] = useState('')
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (licenseKey || tried) return

    const generateLicense = async () => {
      setGenerating(true)
      setTried(true)
      try {
        const res = await fetch('/api/dashboard/generate-license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId: enrollment.id }),
        })
        const data = await res.json()
        if (data.licenseKey) {
          setLicenseKey(data.licenseKey)
        } else {
          setError(data.error || 'خطا در ایجاد لایسنس')
        }
      } catch {
        setError('خطا در ارتباط با سرور')
      } finally {
        setGenerating(false)
      }
    }

    generateLicense()
  }, [licenseKey, tried, enrollment.id])

  const handleCopyLicense = async () => {
    if (licenseKey) {
      await navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Key size={28} className="text-blue-400 sm:hidden" />
          <Key size={32} className="text-blue-400 hidden sm:block" />
        </div>

        <h1 className="text-xl sm:text-2xl font-siavash font-bold text-white mb-2">
          {course.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-400 font-vazir mb-6 sm:mb-8">
          این دوره توسط اسپات‌پلیر پخش می‌شود. برای مشاهده ویدیوها، لایسنس زیر را در نرم‌افزار اسپات‌پلیر وارد کنید.
        </p>

        {/* License key card */}
        {licenseKey ? (
          <div className="bg-white/[0.06] border border-blue-500/20 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Key size={16} className="text-blue-400" />
              <span className="text-sm font-vazir text-gray-300">کلید لایسنس شما</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-xl p-3">
              <code className="flex-1 text-xs sm:text-sm font-mono text-blue-300 truncate" dir="ltr">
                {licenseKey}
              </code>
              <button
                onClick={handleCopyLicense}
                className="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.06] border border-white/5 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            {generating ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
                <span className="text-sm font-vazir text-gray-300">در حال ایجاد لایسنس...</span>
              </div>
            ) : error ? (
              <p className="text-sm font-vazir text-red-400">{error}</p>
            ) : null}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-right">
          <h3 className="text-sm font-vazir font-medium text-white mb-3 sm:mb-4">راهنمای استفاده:</h3>
          <ol className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-vazir text-gray-400">
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs text-blue-400">۱</span>
              <span>نرم‌افزار اسپات‌پلیر را دانلود و نصب کنید</span>
            </li>
            <li className="flex items-center gap-2.5 sm:gap-3">
              <span className="shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs text-blue-400">۲</span>
              <span>لایسنس بالا را کپی کنید</span>
            </li>
            <li className="flex items-center gap-2.5 sm:gap-3">
              <span className="shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs text-blue-400">۳</span>
              <span>در نرم‌افزار لایسنس را وارد کنید و ویدیوها را تماشا کنید</span>
            </li>
          </ol>
        </div>

        {/* Download link */}
        <a
          href="https://app.spotplayer.ir"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 font-vazir font-medium text-sm transition-all duration-300"
        >
          دانلود اسپات‌پلیر
          <ExternalLink size={14} />
        </a>
      </motion.div>
    </div>
  )
}

export default function LessonViewer() {
  const params = useParams()
  const courseSlug = params.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnrolled, setIsEnrolled] = useState(true)
  const completedLessonsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    fetch(`/api/dashboard/courses/${courseSlug}`)
      .then((res) => {
        if (res.status === 403) {
          setIsEnrolled(false)
          setLoading(false)
          return null
        }
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        if (!data) return
        setCourse(data.course)
        setLessons(data.lessons || [])
        setEnrollment(data.enrollment)

        // Build completed lessons set
        const completed = new Set<number>(
          (data.enrollment?.completedLessons || []).map(
            (cl: { lessonId: number }) => cl.lessonId
          )
        )
        completedLessonsRef.current = completed

        // Set first incomplete lesson as active, or first lesson
        const firstIncomplete = data.lessons?.find(
          (l: Lesson) => !completed.has(Number(l.id))
        )
        setActiveLesson(firstIncomplete || data.lessons?.[0] || null)
      })
      .catch(() => setError('خطا در بارگذاری دوره'))
      .finally(() => setLoading(false))
  }, [courseSlug])

  const handleLessonComplete = useCallback(
    async (lessonId: number) => {
      if (!enrollment) return

      // Optimistic update
      completedLessonsRef.current.add(lessonId)
      setEnrollment((prev) => {
        if (!prev) return prev
        const completed = Array.from(completedLessonsRef.current)
        return {
          ...prev,
          completedLessons: completed.map((id) => ({
            lessonId: id,
            completedAt: new Date().toISOString(),
          })),
          progress:
            lessons.length > 0
              ? Math.round((completed.length / lessons.length) * 100)
              : 0,
        }
      })

      // Save to server
      try {
        await fetch('/api/dashboard/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            lessonId,
            completed: true,
          }),
        })
      } catch {
        // Revert on failure
        completedLessonsRef.current.delete(lessonId)
      }
    },
    [enrollment, lessons.length]
  )

  const handleVideoEnded = useCallback(() => {
    if (activeLesson) {
      handleLessonComplete(Number(activeLesson.id))

      // Auto-advance to next lesson
      const currentIndex = lessons.findIndex(
        (l) => l.id === activeLesson.id
      )
      if (currentIndex < lessons.length - 1) {
        setActiveLesson(lessons[currentIndex + 1])
      }
    }
  }, [activeLesson, lessons, handleLessonComplete])

  const isLessonCompleted = (lessonId: number | string) => {
    return completedLessonsRef.current.has(Number(lessonId))
  }

  if (loading) return <LoadingSkeleton />
  if (!isEnrolled) return <NotEnrolledState />
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-vazir">{error}</p>
      </div>
    )
  }
  if (!course) return null

  if (course.courseType === 'spotplayer' && enrollment) {
    return <SpotPlayerView course={course} enrollment={enrollment} />
  }

  if (!activeLesson) return null

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 sm:mb-4"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-vazir text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowRight size={14} />
          بازگشت به داشبورد
        </Link>
      </motion.div>

      <div className="flex flex-col xl:flex-row items-start gap-4 sm:gap-6">
        {/* Main panel: Video + Info */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <VideoPlayer
            key={activeLesson.id}
            lessonId={activeLesson.id}
            title={activeLesson.title}
            onEnded={handleVideoEnded}
          />
        </motion.div>

        {/* Lesson info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-6"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-siavash font-bold text-white">
              {activeLesson.title}
            </h1>
            <span
              className="flex items-center gap-1.5 text-sm font-vazir text-gray-500 shrink-0"
              dir="ltr"
            >
              <Clock size={14} />
              {formatLessonDuration(activeLesson.duration)}
            </span>
          </div>
          {activeLesson.description && (
            <p className="text-sm font-vazir text-gray-400 leading-relaxed">
              {activeLesson.description}
            </p>
          )}
        </motion.div>

      </div>

      {/* Sidebar: Lesson list */}
      <div className="w-full xl:w-80 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden xl:sticky xl:top-6"
        >
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-blue-400" />
              <h2 className="text-sm font-vazir font-medium text-white">
                {course.title}
              </h2>
            </div>
            <p className="text-xs font-vazir text-gray-500">
              {lessons.length} درس •{' '}
              {completedLessonsRef.current.size} تکمیل شده
            </p>
          </div>

          {/* Lesson list */}
          <div className="max-h-[50vh] sm:max-h-[60vh] xl:max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-none">
            <AnimatePresence>
              {lessons.map((lesson, index) => {
                const isActive = activeLesson?.id === lesson.id
                const completed = isLessonCompleted(lesson.id)

                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-right transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                      isActive
                        ? 'bg-blue-500/10 border-r-2 border-r-blue-400'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {completed ? (
                        <CheckCircle2
                          size={18}
                          className="text-green-400"
                        />
                      ) : isActive ? (
                        <Play size={18} className="text-blue-400" />
                      ) : (
                        <Circle size={18} className="text-gray-600" />
                      )}
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-vazir truncate ${
                          isActive
                            ? 'text-blue-300 font-medium'
                            : completed
                              ? 'text-gray-300'
                              : 'text-gray-400'
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs font-vazir text-gray-600"
                          dir="ltr"
                        >
                          {formatLessonDuration(lesson.duration)}
                        </span>
                        {lesson.isFree && (
                          <span className="text-xs font-vazir text-green-500">
                            رایگان
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
