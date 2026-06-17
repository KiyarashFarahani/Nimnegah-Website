'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, Clock } from 'lucide-react';
import CourseCard from './CourseCard';
import type { Course } from './CourseCard';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type FilterState = {
  category: string;
  level: string;
  search: string;
};

const LEVELS = [
  { value: 'beginner', label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'پیشرفته' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      {/* Hero skeleton */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 w-40 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="h-12 w-64 bg-white/10 rounded-lg mx-auto mb-6" />
            <div className="h-1 w-20 bg-white/10 mx-auto mb-6 rounded-full" />
            <div className="h-6 w-96 bg-white/10 rounded mx-auto" />
          </div>

          {/* Search skeleton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-14 bg-white/5 border border-white/10 rounded-2xl" />
          </div>

          {/* Filter skeleton */}
          <div className="flex justify-center gap-3 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-white/5 border border-white/10 rounded-full" />
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-48 sm:h-52 bg-white/5 animate-pulse" />
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
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen size={32} className="text-gray-500" />
      </div>
      <h3 className="text-xl font-siavash font-bold text-white mb-3">
        {hasFilters ? 'دوره‌ای با این فیلترها یافت نشد' : 'هنوز دوره‌ای اضافه نشده'}
      </h3>
      <p className="text-gray-400 font-vazir max-w-md mx-auto">
        {hasFilters
          ? 'فیلترهای خود را تغییر دهید یا فیلترها را پاک کنید'
          : 'به زودی دوره‌های جدید اضافه می‌شوند'}
      </p>
    </motion.div>
  );
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    level: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([coursesData, categoriesData]) => {
        setCourses(coursesData.courses || []);
        setCategories(categoriesData.categories || []);
      })
      .catch(() => {
        setCourses([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (filters.category && course.category?.name !== filters.category) return false;
      if (filters.level && course.level !== filters.level) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = course.title.toLowerCase().includes(searchLower);
        const descriptionMatch = course.description?.root?.children?.some(
          (child: { type?: string; text?: string }) =>
            child.type === 'text' && child.text?.toLowerCase().includes(searchLower)
        );
        if (!titleMatch && !descriptionMatch) return false;
      }
      return true;
    });
  }, [courses, filters]);

  const activeFiltersCount = [filters.category, filters.level].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ category: '', level: '', search: '' });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">

      {/* Hero Section - Compact */}
      <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-siavash font-bold text-white mb-4">
              دوره‌های آموزشی
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto font-vazir leading-relaxed">
              بهترین دوره‌ها رو انتخاب کن و مسیر یادگیریت رو شروع کن
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی دوره..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full h-14 pr-12 pl-12 bg-white/5 border border-white/10 rounded-2xl text-white font-vazir placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter Toggle (Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-4 lg:hidden"
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white font-vazir text-sm hover:bg-white/10 transition-all duration-300"
            >
              <Filter size={16} />
              فیلترها
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mb-6 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
                  className={`px-4 py-2 rounded-full text-sm font-vazir transition-all duration-300 ${
                    !filters.category
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  همه
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters((prev) => ({ ...prev, category: cat.name }))}
                    className={`px-4 py-2 rounded-full text-sm font-vazir transition-all duration-300 ${
                      filters.category === cat.name
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Level Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        level: prev.level === level.value ? '' : level.value,
                      }))
                    }
                    className={`px-4 py-2 rounded-full text-sm font-vazir transition-all duration-300 ${
                      filters.level === level.value
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center items-center gap-3 mt-4"
              >
                <span className="text-sm text-gray-500 font-vazir">فیلترهای فعال:</span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-300 hover:bg-red-500/20 transition-all duration-300"
                >
                  <X size={12} />
                  پاک کردن همه
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex justify-center items-center gap-6 mb-6 text-sm text-gray-500 font-vazir"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} />
              {filteredCourses.length} دوره
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {filteredCourses.reduce((acc, course) => acc + (course.duration || 0), 0).toLocaleString('fa-IR')} دقیقه آموزش
            </span>
          </motion.div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {filteredCourses.length === 0 ? (
            <EmptyState hasFilters={activeFiltersCount > 0 || !!filters.search} />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course, index) => (
                  <div key={course.id} className="flex">
                    <div className="w-full">
                      <CourseCard course={course} index={index} />
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
