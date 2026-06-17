'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSplash } from '@/contexts/SplashContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { splashDone } = useSplash();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('nav')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const scrollToHash = useCallback((hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenisInstance = (window as any).lenis as { scrollTo: (position: number, options?: { duration?: number; easing?: (t: number) => number }) => void } | undefined;
      if (lenisInstance) {
        lenisInstance.scrollTo(offsetPosition, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const navItems = [
    { name: 'صفحه اصلی', href: '/', isHash: false },
    { name: 'دوره‌ها', href: '/courses', isHash: false },
    { name: 'درباره ما', href: '#about', isHash: true },
  ];

  const isTransparent = !scrolled && !isOpen;

  if (!splashDone) return null;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[10001] transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-white/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:ps-6 lg:pe-8">
        <div className="flex items-center h-16">
          {/* Logo + Nav Links — right side in RTL */}
          <div className="flex items-center gap-8 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo/logo.png"
                  alt="نیم‌نگاه"
                  width={48}
                  height={48}
                  className={`h-10 w-auto ${isTransparent ? 'invert' : ''}`}
                  priority
                />
              </Link>
            </motion.div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  {item.isHash ? (
                    <button
                      onClick={() => {
                        scrollToHash(item.href);
                        setIsOpen(false);
                      }}
                      className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-900 hover:text-gray-700'} font-vazir font-medium transition-colors duration-200 relative group`}
                    >
                      {item.name}
                      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isTransparent ? 'bg-white' : 'bg-gray-900'} transition-all duration-300 group-hover:w-full`}></span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-900 hover:text-gray-700'} font-vazir font-medium transition-colors duration-200 relative group`}
                    >
                      {item.name}
                      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isTransparent ? 'bg-white' : 'bg-gray-900'} transition-all duration-300 group-hover:w-full`}></span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Login Button — left side in RTL */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:flex ms-auto"
          >
            <Link
              href="/login"
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-vazir font-medium text-sm transition-all duration-200 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.45)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] ${
                isTransparent
                  ? 'border border-white/40 text-white hover:bg-white/10'
                  : 'border border-gray-900/20 text-gray-900 hover:bg-gray-900 hover:text-white'
              }`}
            >
              ورود / ثبت‌نام
            </Link>
          </motion.div>

          {/* Mobile menu button — left side in RTL */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ms-auto ${isTransparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 fixed top-16 left-0 right-0 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  {item.isHash ? (
                    <button
                      onClick={() => {
                        scrollToHash(item.href);
                        setIsOpen(false);
                      }}
                      className="block text-gray-700 hover:text-gray-900 font-vazir font-medium py-3 px-4 transition-colors text-end w-full min-h-[44px] flex items-center justify-start rounded-lg hover:bg-gray-50"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-700 hover:text-gray-900 font-vazir font-medium py-3 px-4 transition-colors text-end w-full min-h-[44px] flex items-center justify-start rounded-lg hover:bg-gray-50"
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}

              <div className="pt-2 border-t border-gray-100 mt-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.08 }}
                >
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 px-4 rounded-full font-vazir font-medium text-sm border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 min-h-[44px] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.45)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]"
                  >
                    ورود / ثبت‌نام
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
