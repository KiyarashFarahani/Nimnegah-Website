import type { Metadata } from 'next'
import CourseDetail from '@/components/courses/CourseDetail'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nimnegah.com'

type Props = {
  params: Promise<{ slug: string }>
}

async function getCourse(slug: string) {
  try {
    const res = await fetch(`${APP_URL}/api/public/courses/${slug}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.course
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    return {
      title: 'دوره یافت نشد',
      robots: { index: false },
    }
  }

  const title = course.title
  const description = course.description?.root?.children
    ?.map((child: { children?: { text?: string }[] }) =>
      child.children?.map((c) => c.text).join('')
    )
    .join(' ')
    .slice(0, 160) || `دوره ${course.title} در آکادمی نیم‌نگاه`

  const thumbnail = course.thumbnail?.url || `${APP_URL}/og-default.png`
  const courseUrl = `${APP_URL}/courses/${slug}`

  return {
    title,
    description,
    openGraph: {
      title: `${course.title} | نیم‌نگاه`,
      description,
      url: courseUrl,
      siteName: 'آکادمی نیم‌نگاه',
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      locale: 'fa_IR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | نیم‌نگاه`,
      description,
      images: [thumbnail],
    },
    alternates: {
      canonical: courseUrl,
    },
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  return <CourseDetail slug={slug} />
}
