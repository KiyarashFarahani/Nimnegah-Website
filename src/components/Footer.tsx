'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram } from 'lucide-react';

const TelegramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
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
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.376-1.267 8.458-.157.887-.466 1.188-.765 1.218-.652.065-1.146-.431-1.778-.846-.99-.649-1.548-1.052-2.508-1.684-1.11-.732-.39-1.134.242-1.79.166-.172 3.04-2.788 3.096-3.027.007-.03.013-.141-.053-.2-.066-.059-.163-.039-.234-.023-.1.023-1.68 1.069-4.743 3.136-.45.31-.856.46-1.22.45-.401-.008-1.173-.226-1.747-.412-.706-.23-1.264-.35-1.215-.74.025-.203.304-.41.837-.622 3.277-1.428 5.462-2.37 6.554-2.823 3.122-1.3 3.77-1.524 4.192-1.532z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { icon: TelegramIcon, href: 'https://t.me/nimnegah', label: 'تلگرام' },
  { icon: Instagram, href: 'https://instagram.com/nimnegah', label: 'اینستاگرام' },
  { icon: BaleIcon, href: 'https://ble.ir/nimnegah', label: 'بله' },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

const Footer = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const footerLinks = [
    { label: 'خانه', href: isHome ? '#home' : '/#home' },
    { label: 'دوره‌ها', href: '/courses' },
    { label: 'درباره ما', href: isHome ? '#about' : '/#about' },
    { label: 'تماس با ما', href: isHome ? '#contact' : '/#contact' },
    { label: 'ورود', href: '/login' },
  ];

  return (
    <footer className="relative bg-[#040a18] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-siavash font-bold text-white mb-3">نیم‌نگاه</h3>
            <p className="text-sm text-gray-500 font-vazir leading-relaxed max-w-xs">
              آکادمی آموزش هنر دیجیتال و نقاشی. یاد بگیر، خلق کن، بدرخش.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-vazir font-semibold text-gray-400 mb-4 uppercase tracking-wider">لینک‌ها</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-white font-vazir text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white font-vazir text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-vazir font-semibold text-gray-400 mb-4 uppercase tracking-wider">ما را دنبال کنید</h4>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xs text-gray-600 font-vazir flex items-center gap-1.5"
          >
            ساخته شده توسط{' '}
            <a
              href="https://kiyarashfarahani.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              کیارش فراهانی
            </a>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xs text-gray-600 font-vazir"
          >
            &copy; {COPYRIGHT_YEAR} آکادمی نیم‌نگاه. تمامی حقوق محفوظ است.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
