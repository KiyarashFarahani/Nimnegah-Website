'use client';

import { motion } from 'framer-motion';
import { Palette, MonitorPlay, Trophy, Users, BookOpen, Clock } from 'lucide-react';

const FEATURES = [
  {
    icon: Palette,
    title: 'آموزش تخصصی',
    description: 'از مفاهیم پایه تا تکنیک‌های پیشرفته',
  },
  {
    icon: MonitorPlay,
    title: 'ویدیوهای با کیفیت',
    description: 'ضبط حرفه‌ای با بهترین تجهیزات',
  },
  {
    icon: Trophy,
    title: 'گواهی پایان دوره',
    description: 'مدرک معتبر پس از اتمام دوره',
  },
];

const STATS = [
  { icon: Users, value: '۳,۵۰۰+', label: 'دانشجو' },
  { icon: BookOpen, value: '۱۲', label: 'دوره آموزشی' },
  { icon: Clock, value: '۲۰۰+', label: 'ساعت محتوا' },
  { icon: Trophy, value: '۹۵٪', label: 'رضایت دانشجویان' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const AboutAcademy = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-[#0a1628] to-blue-950" />

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top section - Two columns */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full"
            >
              درباره ما
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-siavash font-bold text-white mb-6 leading-tight">
              آکادمی نیم‌نگاه
              <br />
              <span className="text-3xl sm:text-4xl text-gray-400">جایی که هنر شروع میشه</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mb-8 rounded-full" />
            <div className="space-y-5 text-gray-400 font-vazir leading-relaxed text-lg">
              <p>
                ما باور داریم هر کسی می‌تونه هنرمند بشه. آکادمی نیم‌نگاه با هدف ارائه آموزش‌های
                تخصصی و کاربردی هنر دیجیتال تأسیس شده تا مسیر یادگیری رو برای همه هموار کنه.
              </p>
              <p>
                از نقاشی دیجیتال تا طراحی شخصیت، از کامپوزیشن تا رنگ‌بندی — ما اینجاییم
                که کمکت کنیم مهارت‌هات رو بسازی و به سطح بعدی برسی.
              </p>
            </div>
          </motion.div>

          {/* Features grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ x: -4, transition: { duration: 0.2 } }}
                className="group flex items-start gap-5 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <feature.icon size={22} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-siavash font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-vazir leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group text-center p-6 sm:p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/8 transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 mx-auto mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                <stat.icon size={22} className="text-blue-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white font-vazir mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-vazir">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutAcademy;
