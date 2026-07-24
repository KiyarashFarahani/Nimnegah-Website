'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Clock } from 'lucide-react';

const InstagramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/instagram.webp"
    alt="Instagram"
    width={size}
    height={size}
    className={`object-contain ${className}`}
  />
);

const TelegramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/telegram.webp"
    alt="Telegram"
    width={size}
    height={size}
    className={`object-contain ${className}`}
  />
);

const BaleIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/bale.webp"
    alt="Bale"
    width={size}
    height={size}
    className={`object-contain ${className}`}
  />
);

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: 'تلفن تماس',
    value: '۰۹۳۹۶۱۱۲۱۵۵',
    href: 'tel:+989396112155',
  },
  {
    icon: Mail,
    title: 'ثبت سفارشات طراحی',
    value: 'در پیامرسان بله پیام دهید',
    href: 'https://ble.ir/nimnegah_graph_128',
  },
  {
    icon: Clock,
    title: 'ساعات پاسخگویی',
    value: 'شنبه تا پنج‌شنبه، ۱۰ الی ۱۸',
    href: null,
  },
];

const SOCIAL_CHANNELS = [
  {
    icon: TelegramIcon,
    label: 'تلگرام',
    handle: '@nimnegah_graph_128',
    href: 'https://t.me/nimnegah_graph_128',
  },
  {
    icon: InstagramIcon,
    label: 'اینستاگرام',
    handle: '@nimnegah_graph_128',
    href: 'https://instagram.com/nimnegah_graph_128',
  },
  {
    icon: BaleIcon,
    label: 'بله',
    handle: '@nimnegah_graph_128',
    href: 'https://ble.ir/nimnegah_graph_128',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
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

const ContactUs = () => {
  return (
    <section id="contact" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-[#0a1628] to-blue-950" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-vazir font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full"
          >
            تماس با ما
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-siavash font-bold text-white mb-6"
          >
            در ارتباط باشید
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-6 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg text-gray-400 font-vazir max-w-2xl mx-auto leading-relaxed"
          >
            سؤالی دارید؟ از طریق راه‌های ارتباطی زیر با ما در تماس باشید. تیم پشتیبانی نیم‌نگاه آماده پاسخگویی به شماست.
          </motion.p>
        </div>

        {/* Unified cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {CONTACT_ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex items-center gap-4 p-5 bg-white/[0.08] border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.12] transition-all duration-300"
            >
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <item.icon size={20} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-vazir font-medium text-gray-400 mb-0.5">
                  {item.title}
                </h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-white font-vazir font-semibold group-hover:text-blue-300 transition-colors duration-300 truncate block"
                    dir="ltr"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-white font-vazir font-semibold" dir="ltr">
                    {item.value}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {SOCIAL_CHANNELS.map((channel) => (
            <motion.a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex items-center gap-4 p-5 bg-white/[0.08] border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.12] transition-all duration-300"
            >
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/10 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <channel.icon size={20} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-vazir font-medium text-gray-400 mb-0.5">
                  {channel.label}
                </h3>
                <p className="text-white font-vazir font-semibold group-hover:text-blue-300 transition-colors duration-300 truncate" dir="ltr">
                  {channel.handle}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactUs;
