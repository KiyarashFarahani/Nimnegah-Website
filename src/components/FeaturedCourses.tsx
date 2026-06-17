'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import type { SerializedLexicalState } from '@payloadcms/richtext-lexical';

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

const GRADIENTS = [
  'from-blue-600/20 via-blue-500/10 to-cyan-600/20',
  'from-cyan-600/20 via-blue-500/10 to-blue-600/20',
  'from-amber-600/20 via-orange-500/10 to-red-600/20',
];

const ACCENTS = [
  'from-blue-400 to-cyan-400',
  'from-cyan-400 to-blue-400',
  'from-amber-400 to-orange-400',
];

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const heroCardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function LoadingSkeleton() {
  return (
    <section id="courses" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-950 to-blue-950" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-8 w-32 bg-white/10 rounded-full mx-auto mb-6" />
          <div className="h-12 w-64 bg-white/10 rounded-lg mx-auto mb-6" />
          <div className="h-1 w-20 bg-white/10 mx-auto mb-6 rounded-full" />
          <div className="h-6 w-96 bg-white/10 rounded mx-auto" />
        </div>
        {/* Show 2-card skeleton as default */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="h-56 sm:h-64 bg-white/5 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const accent = ACCENTS[index % ACCENTS.length];
  const description = getPlainText(course.description) || 'توضیحات دوره موجود نیست';
  const levelLabel = course.level ? LEVEL_MAP[course.level] || course.level : '';
  const thumbnailUrl = course.thumbnail?.url;
  const categoryName = course.category?.name;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="relative bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[0_0_22px_rgba(59,130,246,0.35)]">
        {/* Thumbnail area - clickable */}
        <Link href={`/courses/${course.slug}`} className={`block relative h-48 sm:h-52 overflow-hidden ${thumbnailUrl ? 'bg-black/20' : `bg-gradient-to-br ${gradient}`}`}>
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-all duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accent} opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500`} />
              </div>
            </>
          )}

          {/* Level badge */}
          {levelLabel && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 rounded-full text-xs font-vazir text-white/90 border border-white/10">
              {levelLabel}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-6">
          {/* Category name */}
          {categoryName && (
            <span className="inline-block text-xs font-vazir text-blue-300 mb-2">
              {categoryName}
            </span>
          )}

          <Link href={`/courses/${course.slug}`} className="block mb-3">
            <h3 className="text-xl font-siavash font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-400 font-vazir mb-5 leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-5 text-xs text-gray-500 font-vazir">
            {course.duration != null && course.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-500" />
                {formatDuration(course.duration)}
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-vazir">
                {formatPrice(course.price)}
              </span>
              <span className="text-xs text-gray-500 font-vazir">تومان</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/courses/${course.slug}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-sm font-vazir text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.65)]"
              >
                مشاهده
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroCourseCard({ course }: { course: Course }) {
  const gradient = GRADIENTS[0];
  const accent = ACCENTS[0];
  const description = getPlainText(course.description) || 'توضیحات دوره موجود نیست';
  const levelLabel = course.level ? LEVEL_MAP[course.level] || course.level : '';
  const thumbnailUrl = course.thumbnail?.url;
  const categoryName = course.category?.name;

  return (
    <motion.div
      variants={heroCardVariants}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="relative bg-white/[0.08] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[0_0_22px_rgba(59,130,246,0.35)]">
        <div className="flex flex-col lg:flex-row">
          {/* Thumbnail area - clickable, larger for hero */}
          <Link href={`/courses/${course.slug}`} className={`block relative w-full lg:w-1/2 h-64 sm:h-72 lg:h-[420px] overflow-hidden flex-shrink-0 ${thumbnailUrl ? 'bg-black/20' : `bg-gradient-to-br ${gradient}`}`}>
            {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              className="object-cover group-hover:scale-105 transition-all duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            ) : (
              <>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${accent} opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500`} />
                </div>
              </>
            )}

            {/* Level badge */}
            {levelLabel && (
              <div className="absolute top-5 right-5 px-4 py-1.5 bg-black/40 rounded-full text-sm font-vazir text-white/90 border border-white/10">
                {levelLabel}
              </div>
            )}
          </Link>

          {/* Content - more spacious for hero */}
          <div className="flex-1 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Category name */}
            {categoryName && (
              <span className="inline-block text-sm font-vazir text-blue-300 mb-3">
                {categoryName}
              </span>
            )}

            <Link href={`/courses/${course.slug}`} className="block mb-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-siavash font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                {course.title}
              </h3>
            </Link>
            <p className="text-base text-gray-400 font-vazir mb-6 leading-relaxed line-clamp-3">
              {description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 mb-8 text-sm text-gray-500 font-vazir">
              {course.duration != null && course.duration > 0 && (
                <span className="flex items-center gap-2">
                  <Clock size={15} className="text-gray-500" />
                  {formatDuration(course.duration)}
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-vazir">
                  {formatPrice(course.price)}
                </span>
                <span className="text-sm text-gray-500 font-vazir">تومان</span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-base font-vazir text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.65)]"
                >
                  مشاهده دوره
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/courses/featured')
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const count = courses.length;

  // Determine grid classes based on course count
  const gridClassName =
    count === 1
      ? 'max-w-4xl mx-auto'
      : count === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';

  return (
    <section id="courses" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-950 to-blue-950" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full"
          >
            دوره‌های آموزشی
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-white mb-6">
            دوره‌های ویژه
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-6 rounded-full" />
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-vazir leading-relaxed">
            بهترین دوره‌ها رو انتخاب کن و مسیر یادگیریت رو شروع کن
          </p>
        </motion.div>

        {/* Course cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={gridClassName}
        >
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 font-vazir text-lg">به زودی دوره‌های جدید اضافه می‌شوند</p>
            </div>
          ) : count === 1 ? (
            <HeroCourseCard course={courses[0]} />
          ) : (
            courses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))
          )}
        </motion.div>

        {/* View all link - only show if there might be more courses */}
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/20 text-white font-vazir font-medium rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.45)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]"
              >
                مشاهده همه دوره‌ها
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
