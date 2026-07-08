import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nimnegah.com'

export const metadata: Metadata = {
  title: 'ورود / ثبت‌نام',
  description: 'ورود به آکادمی نیم‌نگاه با شماره موبایل',
  robots: { index: false },
  alternates: {
    canonical: `${APP_URL}/login`,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
