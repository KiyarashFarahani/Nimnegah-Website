import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تکمیل پروفایل',
  description: 'تکمیل اطلاعات حساب کاربری',
  robots: { index: false },
}

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
