import type { Metadata } from 'next'
import CourseCatalog from '@/components/courses/CourseCatalog'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nimnegah.com'

export const metadata: Metadata = {
  title: 'دوره‌های آموزشی',
  description: 'تمامی دوره‌های آموزشی آکادمی نیم‌نگاه — هنر، طراحی و مهارت‌های تخصصی',
  openGraph: {
    title: 'دوره‌های آموزشی | نیم‌نگاه',
    description: 'تمامی دوره‌های آموزشی آکادمی نیم‌نگاه — هنر، طراحی و مهارت‌های تخصصی',
    url: `${APP_URL}/courses`,
    siteName: 'آکادمی نیم‌نگاه',
    locale: 'fa_IR',
    type: 'website',
  },
  alternates: {
    canonical: `${APP_URL}/courses`,
  },
}

export default function CoursesPage() {
  return <CourseCatalog />
}
