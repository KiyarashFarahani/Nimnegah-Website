'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

const InstagramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/instagram.webp"
    alt="Instagram"
    width={size}
    height={size}
    className={`object-contain ${className}`}
  />
);

const SOCIAL_LINKS = [
  { icon: TelegramIcon, href: 'https://t.me/nimnegah_graph_128', label: 'تلگرام' },
  { icon: InstagramIcon, href: 'https://instagram.com/nimnegah_graph_128', label: 'اینستاگرام' },
  { icon: BaleIcon, href: 'https://ble.ir/nimnegah_graph_128', label: 'بله' },
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
                راهنمای قدم به قدم رسیدن به یک طراح حرفه ای
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
