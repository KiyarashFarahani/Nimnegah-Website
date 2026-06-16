'use client';

import { motion } from 'framer-motion';
import { Clock, Users, BookOpen, ArrowRight, Star } from 'lucide-react';

const COURSES = [
  {
    id: 1,
    title: 'نقاشی دیجیتال از صفر تا صد',
    slug: 'digital-painting',
    description: 'یاد بگیرید چطور با ابزارهای دیجیتال شاهکار خلق کنید',
    price: '۲,۵۰۰,۰۰۰',
    originalPrice: '۳,۸۰۰,۰۰۰',
    duration: '۴۲ ساعت',
    students: '۱,۲۳۴',
    lessons: '۶۴',
    level: 'مبتدی تا پیشرفته',
    rating: 4.8,
    gradient: 'from-violet-100 via-purple-50 to-fuchsia-100',
    accent: 'from-violet-300 to-fuchsia-300',
  },
  {
    id: 2,
    title: 'طراحی شخصیت حرفه‌ای',
    slug: 'character-design',
    description: 'تکنیک‌های طراحی شخصیت برای انیمیشن و بازی',
    price: '۱,۸۰۰,۰۰۰',
    originalPrice: '۲,۵۰۰,۰۰۰',
    duration: '۲۸ ساعت',
    students: '۸۷۶',
    lessons: '۴۵',
    level: 'متوسط',
    rating: 4.9,
    gradient: 'from-cyan-100 via-blue-50 to-indigo-100',
    accent: 'from-cyan-300 to-blue-300',
  },
  {
    id: 3,
    title: 'کامپوزیشن و رنگ‌بندی',
    slug: 'composition-color',
    description: 'اصول ترکیب‌بندی و روانشناسی رنگ در آثار هنری',
    price: '۱,۲۰۰,۰۰۰',
    originalPrice: '۱,۸۰۰,۰۰۰',
    duration: '۱۸ ساعت',
    students: '۲,۱۰۵',
    lessons: '۳۲',
    level: 'همه سطوح',
    rating: 4.7,
    gradient: 'from-amber-100 via-orange-50 to-red-100',
    accent: 'from-amber-300 to-orange-300',
  },
];

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

const FeaturedCourses = () => {
  return (
    <section id="courses" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-3xl" />

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
            className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full"
          >
            دوره‌های آموزشی
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-gray-900 mb-6">
            دوره‌های ویژه
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-6 rounded-full" />
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-vazir leading-relaxed">
            بهترین دوره‌ها رو انتخاب کن و مسیر یادگیریت رو شروع کن
          </p>
        </motion.div>

        {/* Course cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {COURSES.map((course) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="relative bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-500">
                {/* Thumbnail area */}
                <div className={`relative h-48 sm:h-52 bg-gradient-to-br ${course.gradient} overflow-hidden`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/60 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/60 rounded-full" />

                  {/* Level badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-vazir text-gray-700 border border-gray-200/60">
                    {course.level}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-white/80 backdrop-blur-md rounded-full border border-gray-200/60">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-vazir text-gray-700">{course.rating}</span>
                  </div>

                  {/* Course icon placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${course.accent} opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500`} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-siavash font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-vazir mb-5 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-5 text-xs text-gray-500 font-vazir">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      {course.students}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-gray-400" />
                      {course.lessons} درس
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 font-vazir">{course.price}</span>
                      <span className="text-xs text-gray-400 font-vazir line-through">{course.originalPrice}</span>
                      <span className="text-xs text-gray-400 font-vazir">تومان</span>
                    </div>
                    <motion.a
                      href={`/courses/${course.slug}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-vazir text-gray-700 transition-all duration-300"
                    >
                      مشاهده
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.a
            href="/courses"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-vazir font-medium rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
          >
            مشاهده همه دوره‌ها
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
