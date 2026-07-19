'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Clock, Send, Instagram } from 'lucide-react';

const TelegramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const BaleIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.376-1.267 8.458-.157.887-.466 1.188-.765 1.218-.652.065-1.146-.431-1.778-.846-.99-.649-1.548-1.052-2.508-1.684-1.11-.732-.39-1.134.242-1.79.166-.172 3.04-2.788 3.096-3.027.007-.03.013-.141-.053-.2-.066-.059-.163-.039-.234-.023-.1.023-1.68 1.069-4.743 3.136-.45.31-.856.46-1.22.45-.401-.008-1.173-.226-1.747-.412-.706-.23-1.264-.35-1.215-.74.025-.203.304-.41.837-.622 3.277-1.428 5.462-2.37 6.554-2.823 3.122-1.3 3.77-1.524 4.192-1.532z" />
  </svg>
);

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: 'تلفن تماس',
    value: '۰۲۱-۱۲۳۴۵۶۷۸',
    href: 'tel:+982112345678',
  },
  {
    icon: Mail,
    title: 'ایمیل',
    value: 'info@nimnegah.com',
    href: 'mailto:info@nimnegah.com',
  },
  {
    icon: Clock,
    title: 'ساعات پاسخگویی',
    value: 'شنبه تا پنج‌شنبه، ۹ الی ۱۸',
    href: null,
  },
];

const SOCIAL_CHANNELS = [
  {
    icon: TelegramIcon,
    label: 'تلگرام',
    handle: '@nimnegah',
    href: 'https://t.me/nimnegah',
  },
  {
    icon: Instagram,
    label: 'اینستاگرام',
    handle: '@nimnegah',
    href: 'https://instagram.com/nimnegah',
  },
  {
    icon: BaleIcon,
    label: 'بله',
    handle: '@nimnegah',
    href: 'https://ble.ir/nimnegah',
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
