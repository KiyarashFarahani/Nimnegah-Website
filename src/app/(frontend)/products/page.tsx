import type { Metadata } from 'next'
import ProductCatalog from '@/components/products/ProductCatalog'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nimnegah.com'

export const metadata: Metadata = {
  title: 'محصولات دیجیتال',
  description: 'فایل‌های اختصاصی آکادمی نیم‌نگاه برای دانلود — پس از خرید، لینک دانلود امن و اختصاصی دریافت کنید',
  openGraph: {
    title: 'محصولات دیجیتال | نیم‌نگاه',
    description: 'فایل‌های اختصاصی آکادمی نیم‌نگاه برای دانلود — پس از خرید، لینک دانلود امن و اختصاصی دریافت کنید',
    url: `${APP_URL}/products`,
    siteName: 'آکادمی نیم‌نگاه',
    locale: 'fa_IR',
    type: 'website',
  },
  alternates: {
    canonical: `${APP_URL}/products`,
  },
}

export default function ProductsPage() {
  return <ProductCatalog />
}
