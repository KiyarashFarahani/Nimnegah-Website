'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, User, LogOut, Menu, X, Home, GraduationCap } from 'lucide-react'
import Image from 'next/image'

type Userinfo = {
  name: string
  phone: string
}

const NAV_ITEMS = [
  { label: 'دوره‌های من', href: '/dashboard', icon: BookOpen },
  { label: 'پروفایل', href: '/dashboard/profile', icon: User },
]

export default function Sidebar({
  user,
  onLogout,
}: {
  user: Userinfo
  onLogout: () => void
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo.png"
            alt="نیم‌نگاه"
            width={36}
            height={36}
            className="h-8 w-auto invert"
            priority
          />
          <span className="text-lg font-siavash font-bold text-white">
            نیم‌نگاه
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-vazir text-sm transition-all duration-200 ${
                active
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-white/5 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-vazir text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Home size={18} />
            صفحه اصلی
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-vazir text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <GraduationCap size={18} />
            خرید دوره‌ی جدید
          </Link>
        </div>
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-4 py-3 mb-2">
          <p className="text-sm font-vazir text-white truncate">{user.name || 'کاربر جدید'}</p>
          <p className="text-xs font-vazir text-gray-500 mt-0.5" dir="ltr">
            {user.phone}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-vazir text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          خروج
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/15 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white/[0.04] border-l border-white/10 fixed top-0 right-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-blue-950 border-l border-white/10 z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
