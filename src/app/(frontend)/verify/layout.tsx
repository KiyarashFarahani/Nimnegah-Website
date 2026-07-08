import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تأیید کد',
  description: 'تأیید کد ورود به آکادمی نیم‌نگاه',
  robots: { index: false },
}

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
