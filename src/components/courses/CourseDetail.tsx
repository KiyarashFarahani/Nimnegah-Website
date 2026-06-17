'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  BookOpen,
  BarChart3,
  ChevronDown,
  Play,
  Lock,
  ArrowRight,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { SerializedLexicalState } from '@payloadcms/richtext-lexical';

type Lesson = {
  id: string | number;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isFree: boolean;
};

type Course = {
  id: string | number;
  title: string;
  slug: string;
  description?: SerializedLexicalState;
  price: number;
  duration?: number;
  level?: string;
  thumbnail?: { url: string } | null;
  category?: { name: string } | null;
};

const LEVEL_MAP: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours} ساعت و ${remaining} دقیقه` : `${hours} ساعت`;
  }
  return `${minutes} دقیقه`;
}

function formatLessonDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getPlainText(richText?: SerializedLexicalState): string {
  if (!richText?.root?.children) return '';
  type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] };
  const extractText = (nodes: LexicalNode[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || '';
        if (node.children) return extractText(node.children);
        return '';
      })
      .join(' ');
  };
  return extractText(richText.root.children as LexicalNode[]).trim();
}

function totalLessonsDuration(lessons: Lesson[]): number {
  return lessons.reduce((acc, l) => acc + l.duration, 0);
}

/* ─── Loading Skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero skeleton */}
          <div className="rounded-2xl h-64 sm:h-80 lg:h-96 bg-white/5 border border-white/10 animate-pulse mb-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="mt-8 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-4">
              <div className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 404 State ─── */
function NotFoundState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-24">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-gray-500" />
          </div>
          <h1 className="text-3xl font-siavash font-bold text-white mb-4">دوره یافت نشد</h1>
          <p className="text-gray-400 font-vazir mb-8">متأسفانه این دوره وجود ندارد یا هنوز منتشر نشده</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-vazir transition-all duration-300"
            >
              بازگشت به دوره‌ها
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson Item ─── */
function LessonItem({
  lesson,
  index,
  isLast,
}: {
  lesson: Lesson;
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-center gap-4 px-5 py-4 ${
        !isLast ? 'border-b border-white/5' : ''
    }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        {lesson.isFree ? (
          <Play size={14} className="text-blue-400" />
        ) : (
          <Lock size={14} className="text-gray-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-vazir text-white/90 truncate">{lesson.title}</p>
        {lesson.description && (
          <p className="text-xs font-vazir text-gray-500 truncate mt-0.5">{lesson.description}</p>
        )}
      </div>
      <span className="text-xs font-vazir text-gray-500 flex-shrink-0" dir="ltr">
        {formatLessonDuration(lesson.duration)}
      </span>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function CourseDetail({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        if (!data.course) {
          setNotFound(true);
          return;
        }
        setCourse(data.course);
        setLessons(data.lessons || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (notFound || !course) return <NotFoundState />;

  const description = getPlainText(course.description) || 'توضیحاتی ثبت نشده است';
  const levelLabel = course.level ? LEVEL_MAP[course.level] || course.level : '';
  const thumbnailUrl = course.thumbnail?.url;
  const categoryName = course.category?.name;
  const freeLessons = lessons.filter((l) => l.isFree);
  const totalDuration = course.duration || Math.round(totalLessonsDuration(lessons) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={course.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/50 to-transparent" />

        {/* Content over banner */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {categoryName && (
                <span className="inline-block px-3 py-1 mb-3 text-xs font-vazir font-medium text-blue-300 bg-blue-500/20 border border-blue-500/20 rounded-full">
                  {categoryName}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-siavash font-bold text-white mb-2">
                {course.title}
              </h1>
              {levelLabel && (
                <span className="text-sm font-vazir text-gray-300">{levelLabel}</span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Description + Lessons */}
            <div className="lg:col-span-2">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-siavash font-bold text-white mb-4">درباره دوره</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-sm font-vazir text-gray-300 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              </motion.div>

              {/* Lessons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10"
              >
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-3 mb-4 group w-full text-right"
                >
                  <h2 className="text-xl font-siavash font-bold text-white">سرفصل‌ها</h2>
                  <span className="text-xs font-vazir text-gray-500">
                    ({lessons.length} درس)
                  </span>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="me-auto"
                  >
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                      {lessons.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-400 font-vazir text-sm">
                            هنوز درسی اضافه نشده
                          </p>
                        </div>
                      ) : (
                        lessons.map((lesson, i) => (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            index={i}
                            isLast={i === lessons.length - 1}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="sticky top-24"
              >
                <div className="bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden">
                  {/* Price header */}
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-white font-vazir">
                        {formatPrice(course.price)}
                      </span>
                      <span className="text-sm text-gray-500 font-vazir">تومان</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.65)] flex items-center justify-center gap-2"
                    >
                      خرید دوره
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>

                  {/* Info list */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-vazir">مدت زمان</p>
                        <p className="text-sm text-white font-vazir">{formatDuration(totalDuration)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-vazir">تعداد دروس</p>
                        <p className="text-sm text-white font-vazir">{lessons.length} درس</p>
                      </div>
                    </div>

                    {levelLabel && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <BarChart3 size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-vazir">سطح</p>
                          <p className="text-sm text-white font-vazir">{levelLabel}</p>
                        </div>
                      </div>
                    )}

                    {categoryName && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Tag size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-vazir">دسته‌بندی</p>
                          <p className="text-sm text-white font-vazir">{categoryName}</p>
                        </div>
                      </div>
                    )}

                    {freeLessons.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <Play size={16} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-vazir">پیش‌نمایش رایگان</p>
                          <p className="text-sm text-white font-vazir">{freeLessons.length} درس رایگان</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guarantee */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                      <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                      <p className="text-xs font-vazir text-gray-400">
                        ضمانت بازگشت وجه تا ۷ روز
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
