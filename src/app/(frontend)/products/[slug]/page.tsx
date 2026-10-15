import type { Metadata } from 'next'
import ProductDetail from '@/components/products/ProductDetail'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nimnegah.com'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${APP_URL}/api/public/products/${slug}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.product
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'محصول یافت نشد',
      robots: { index: false },
    }
  }

  const title = product.title
  const description = product.description?.root?.children
    ?.map((child: { children?: { text?: string }[] }) =>
      child.children?.map((c) => c.text).join('')
    )
    .join(' ')
    .slice(0, 160) || `محصول ${product.title} در آکادمی نیم‌نگاه`

  const thumbnail = product.thumbnail?.url || `${APP_URL}/og-default.png`
  const productUrl = `${APP_URL}/products/${slug}`

  return {
    title,
    description,
    openGraph: {
      title: `${product.title} | نیم‌نگاه`,
      description,
      url: productUrl,
      siteName: 'آکادمی نیم‌نگاه',
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: 'fa_IR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | نیم‌نگاه`,
      description,
      images: [thumbnail],
    },
    alternates: {
      canonical: productUrl,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return <ProductDetail slug={slug} />
}
