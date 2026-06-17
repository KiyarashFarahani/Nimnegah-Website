'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import type { SerializedLexicalState } from '@payloadcms/richtext-lexical';

export type Course = {
  id: string | number;
  title: string;
  slug: string;
  description?: SerializedLexicalState;
  price: number;
  duration?: number;
  level?: string;
  thumbnail?: { url: string } | null;
  category?: { name: string } | null;
  lessonsCount?: number;
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

export default function CourseCard({ course, index }: { course: Course; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const accent = ACCENTS[index % ACCENTS.length];
  const description = getPlainText(course.description) || 'توضیحات دوره موجود نیست';
  const levelLabel = course.level ? LEVEL_MAP[course.level] || course.level : '';
  const thumbnailUrl = course.thumbnail?.url;
  const categoryName = course.category?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative h-full flex flex-col"
    >
      <div className="relative bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[0_0_22px_rgba(59,130,246,0.35)] h-full flex flex-col">
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
        <div className="p-6 flex flex-col flex-grow">
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
          <p className="text-sm text-gray-400 font-vazir mb-5 leading-relaxed line-clamp-2 flex-grow">
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
            {course.lessonsCount != null && course.lessonsCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="text-gray-500">•</span>
                {course.lessonsCount} درس
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
