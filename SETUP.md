# Nimnegah — Manual Setup Guide

Step-by-step commands to set up the full development environment.
Run these in order from the project root.

## Prerequisites

- **Node.js 22 LTS** (NOT Node 26 — incompatible with Payload 3.x and tsx)
- Docker Desktop running
- npm

Install Node 22 via nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.zshrc
nvm install 22
nvm use 22
```

All `payload` commands must use `--disable-transpile` flag (Node 22 native TS support).

---

## Step 1: Downgrade Next.js (required for Payload 3.x)

Payload 3.85.1 requires `next@>=15.4.11 <15.5.0`. The current `15.5.x` is out of range.

```bash
cd /Users/kiyarash/Documents/Coding/Sandbox/artist-portfolio-template
npm install next@15.4.11 --legacy-peer-deps
```

---

## Step 2: Install Payload CMS + dependencies

```bash
npm install payload@latest @payloadcms/db-postgres@latest @payloadcms/richtext-lexical@latest ioredis@latest --legacy-peer-deps
```

Verify installed versions:
```bash
npm ls payload
# Should show payload@3.85.1
```

---

## Step 3: Start Docker (PostgreSQL + Redis)

The docker-compose file is at `docker/docker-compose.yml`. It loads `.env` from the project root. Start it:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Verify both containers are running:
```bash
docker compose -f docker/docker-compose.yml ps
```

You should see:
- `db` (postgres:16-alpine) — port 5432
- `redis` (redis:7-alpine) — port 6379

Test PostgreSQL connection:
```bash
docker exec -it artist-portfolio-template-db-1 psql -U nimnegah -d nimnegah -c "SELECT 1;"
```

Test Redis connection:
```bash
docker exec -it artist-portfolio-template-redis-1 redis-cli ping
# Should return: PONG
```

---

## Step 4: Update .env with real secrets

Generate secure secrets:
```bash
# Payload secret (32 chars)
openssl rand -hex 16

# JWT secret (32 chars)
openssl rand -hex 16

# DB password (16 chars)
openssl rand -hex 8
```

Update `.env` with the generated values. Also update `DB_PASSWORD` to match the one in `DATABASE_URL`.

---

## Step 5: Create Payload Config

Create `src/payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { Users } from './collections/Users'
import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Categories } from './collections/Categories'
import { Orders } from './collections/Orders'
import { Enrollments } from './collections/Enrollments'
import { Media } from './collections/Media'

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Users,
    Courses,
    Lessons,
    Categories,
    Orders,
    Enrollments,
    Media,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
})
```

---

## Step 6: Create All 7 Collections

### `src/collections/Users.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      label: 'Phone Number',
    },
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'student',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Student', value: 'student' },
      ],
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
```

### `src/collections/Courses.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'beginner',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total duration in minutes',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
```

### `src/collections/Lessons.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Duration in seconds',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFree',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Allow non-enrolled users to watch this lesson',
      },
    },
  ],
}
```

### `src/collections/Categories.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
```

### `src/collections/Orders.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'zarinpalRefId',
      type: 'text',
    },
    {
      name: 'authority',
      type: 'text',
    },
  ],
}
```

### `src/collections/Enrollments.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'progress',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'enrolledAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
```

### `src/collections/Media.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
```

---

## Step 7: Wire Up Payload Admin Routes

### `src/app/(payload)/admin/[[...segments]]/page.tsx`

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import config from '@payload-config'
import { importMap } from '../importMap'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
```

### `src/app/(payload)/layout.tsx`

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
```

### `src/app/(payload)/admin/importMap.js`

```js
// Auto-generated by Payload CMS — run `npx payload generate:importmap` after initial setup
export const importMap = {}
```

### `src/app/(payload)/custom.scss`

```scss
// Add custom Payload admin styles here
```

### `src/app/api/(payload)/[...payload]/route.ts`

```tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

---

## Step 8: Run Database Migration

After creating the payload config and collections, generate types and migrate:

```bash
npx payload generate:types
npx payload generate:importmap
npx payload migrate
```

If the database doesn't exist yet, Payload will create the tables on first `migrate` run.

---

## Step 9: Create Auth Helpers

### `src/lib/redis.ts`

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export default redis

export async function setOTP(phone: string, code: string, ttlSeconds = 300) {
  await redis.set(`otp:${phone}`, code, 'EX', ttlSeconds)
}

export async function getOTP(phone: string) {
  return redis.get(`otp:${phone}`)
}

export async function deleteOTP(phone: string) {
  await redis.del(`otp:${phone}`)
}
```

### `src/lib/smsir.ts`

```typescript
const SMSIR_API_KEY = process.env.SMSIR_API_KEY!
const SMSIR_LINE_NUMBER = process.env.SMSIR_LINE_NUMBER!
const SMSIR_TEMPLATE_ID = process.env.SMSIR_TEMPLATE_ID!

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(phone: string, code: string): Promise<void> {
  const response = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SMSIR_API_KEY}`,
    },
    body: JSON.stringify({
      mobile: phone,
      templateId: Number(SMSIR_TEMPLATE_ID),
      parameters: [{ name: 'CODE', value: code }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SMS send failed: ${error}`)
  }
}
```

---

## Step 10: Create Auth API Routes

### `src/app/api/auth/send-otp/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { generateOTP, sendOTP } from '@/lib/smsir'
import { setOTP } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const code = generateOTP()
    await setOTP(phone, code)
    await sendOTP(phone, code)

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
```

### `src/app/api/auth/verify-otp/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getOTP, deleteOTP } from '@/lib/redis'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
    }

    const storedCode = await getOTP(phone)

    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    await deleteOTP(phone)

    // Find or create user
    const payload = await config

    const existingUsers = await payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
    })

    let user

    if (existingUsers.docs.length > 0) {
      user = existingUsers.docs[0]
    } else {
      user = await payload.create({
        collection: 'users',
        data: {
          phone,
          name: '',
          role: 'student',
        },
      })
    }

    // Generate token
    const token = await payload.signToken({
      collection: 'users',
      data: { id: user.id },
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token,
    })

    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
```

### `src/app/api/auth/me/route.ts`

```typescript
import { NextResponse } from 'next/server'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const payload = await config
    const user = await payload.auth({ headers: new Headers({ authorization: `Bearer ${token}` }) })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error('Me route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
```

### `src/app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('payload-token', '', { maxAge: 0, path: '/' })
  return response
}
```

---

## Step 11: Restructure App Router

Move existing portfolio to route group:

```bash
mkdir -p src/app/\(frontend\)
mv src/app/page.tsx src/app/\(frontend\)/page.tsx
mv src/app/layout.tsx src/app/\(frontend\)/layout.tsx
```

### Create root layout `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nimnegah | نیم‌نگاه',
  description: 'Online course platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### Update `src/app/(frontend)/layout.tsx`

```tsx
import { customFont, editorialPro } from '@/lib/fonts'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import '../globals.css'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      {children}
    </SmoothScrollProvider>
  )
}
```

---

## Step 12: Create Zarinpal Helper

### `src/lib/zarinpal.ts`

```typescript
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true'
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`

const SANDBOX_URL = 'https://sandbox.zarinpal.com/pg/rest/WebGate'
const LIVE_URL = 'https://api.zarinpal.com/pg/rest/WebGate'

const baseUrl = ZARINPAL_SANDBOX ? SANDBOX_URL : LIVE_URL

export async function initializePayment(
  amount: number,
  description: string,
  mobile?: string,
  email?: string,
) {
  const response = await fetch(`${baseUrl}/PaymentRequest.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      MerchantID: ZARINPAL_MERCHANT_ID,
      Amount: amount * 10, // Convert Tomans to Rials
      CallbackURL,
      Description: description,
      Mobile: mobile,
      Email: email,
    }),
  })

  const data = await response.json()

  if (data.Status === 100 || data.Status === 101) {
    const redirectUrl = ZARINPAL_SANDBOX
      ? `https://sandbox.zarinpal.com/pg/StartPay/${data.Authority}`
      : `https://www.zarinpal.com/pg/StartPay/${data.Authority}`
    return { success: true, redirectUrl, authority: data.Authority }
  }

  return { success: false, error: data.Message }
}

export async function verifyPayment(authority: string, amount: number) {
  const response = await fetch(`${baseUrl}/PaymentVerification.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      MerchantID: ZARINPAL_MERCHANT_ID,
      Amount: amount * 10, // Convert Tomans to Rials
      Authority: authority,
    }),
  })

  const data = await response.json()

  if (data.Status === 100 || data.Status === 101) {
    return { success: true, refId: data.RefID }
  }

  return { success: false, error: data.Message }
}
```

---

## Step 13: Create Payment API Routes

### `src/app/api/payment/create/route.ts`

```typescript
import { NextResponse } from 'next/server'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { initializePayment } from '@/lib/zarinpal'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await config
    const user = await payload.auth({ headers: new Headers({ authorization: `Bearer ${token}` }) })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Create pending order
    const order = await payload.create({
      collection: 'orders',
      data: {
        user: user.id,
        course: course.id,
        amount: course.price,
        status: 'pending',
      },
    })

    // Initialize Zarinpal payment
    const payment = await initializePayment(
      course.price,
      `خرید دوره: ${course.title}`,
    )

    if (!payment.success) {
      return NextResponse.json({ error: payment.error }, { status: 500 })
    }

    // Store authority in order
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { authority: payment.authority },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirectUrl,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
```

### `src/app/api/payment/verify/route.ts`

```typescript
import { NextResponse } from 'next/server'
import config from '@payload-config'
import { verifyPayment } from '@/lib/zarinpal'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authority = searchParams.get('Authority')
    const status = searchParams.get('Status')

    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(new URL('/courses?error=payment_failed', process.env.NEXT_PUBLIC_APP_URL!))
    }

    const payload = await config

    // Find the order by authority
    const orders = await payload.find({
      collection: 'orders',
      where: { authority: { equals: authority } },
    })

    if (orders.docs.length === 0) {
      return NextResponse.redirect(new URL('/courses?error=order_not_found', process.env.NEXT_PUBLIC_APP_URL!))
    }

    const order = orders.docs[0]

    // Verify with Zarinpal
    const result = await verifyPayment(authority, order.amount)

    if (result.success) {
      // Update order status
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'completed',
          zarinpalRefId: result.refId,
        },
      })

      // Create enrollment
      await payload.create({
        collection: 'enrollments',
        data: {
          user: order.user,
          course: order.course,
          progress: 0,
          enrolledAt: new Date(),
        },
      })

      // Get course slug for redirect
      const course = await payload.findByID({
        collection: 'courses',
        id: order.course,
      })

      return NextResponse.redirect(
        new URL(`/dashboard/${course.slug}`, process.env.NEXT_PUBLIC_APP_URL!),
      )
    } else {
      // Update order as failed
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'failed' },
      })

      return NextResponse.redirect(new URL('/courses?error=payment_failed', process.env.NEXT_PUBLIC_APP_URL!))
    }
  } catch (error) {
    console.error('Payment verify error:', error)
    return NextResponse.redirect(new URL('/courses?error=server_error', process.env.NEXT_PUBLIC_APP_URL!))
  }
}
```

---

## Step 14: Create Dockerfile

### `docker/Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Also add to `next.config.ts` for standalone output:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}
```

---

## Step 15: Create nginx.conf

### `docker/nginx.conf`

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads (public)
    location /uploads/ {
        alias /var/data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Videos (auth required — check via app)
    location /videos/ {
        internal;
        alias /var/data/videos/;
    }
}
```

---

## Step 16: Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "payload": "payload",
    "payload:generate": "payload generate:types && payload generate:importmap",
    "payload:migrate": "payload migrate"
  }
}
```

---

## Quick Reference: File Structure After Setup

```
src/
├── app/
│   ├── (payload)/
│   │   ├── admin/
│   │   │   ├── [[...segments]]/page.tsx
│   │   │   └── importMap.js
│   │   ├── layout.tsx
│   │   └── custom.scss
│   ├── (frontend)/
│   │   ├── layout.tsx              ← moved from src/app/layout.tsx
│   │   ├── page.tsx                ← moved from src/app/page.tsx
│   │   └── courses/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── api/
│   │   ├── (payload)/
│   │   │   └── [...payload]/route.ts
│   │   ├── auth/
│   │   │   ├── send-otp/route.ts
│   │   │   ├── verify-otp/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   └── payment/
│   │       ├── create/route.ts
│   │       └── verify/route.ts
│   ├── layout.tsx                  ← NEW root layout
│   └── globals.css
├── collections/
│   ├── Users.ts
│   ├── Courses.ts
│   ├── Lessons.ts
│   ├── Categories.ts
│   ├── Orders.ts
│   ├── Enrollments.ts
│   └── Media.ts
├── lib/
│   ├── payload.ts                  ← auto-generated
│   ├── smsir.ts
│   ├── redis.ts
│   ├── zarinpal.ts
│   ├── auth.ts
│   └── fonts.ts                    ← existing
├── components/                     ← existing
├── data/                           ← existing
└── hooks/                          ← existing
```

---

## Troubleshooting

### Docker containers won't start
```bash
# Check if ports are in use
lsof -i :5432
lsof -i :6379

# Kill existing processes if needed
kill $(lsof -t -i :5432)
```

### Payload build fails with "module not found"
```bash
rm -rf node_modules .next
npm install --legacy-peer-deps
```

### Database connection refused
```bash
# Verify Docker is running
docker ps

# Check logs
docker compose -f docker/docker-compose.yml logs db
```

### Redis connection refused
```bash
docker compose -f docker/docker-compose.yml logs redis
```

---

## Checklist

After running all steps, verify:

- [ ] `docker compose ps` shows db and redis running
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts the dev server
- [ ] `http://localhost:3000` loads the portfolio
- [ ] `http://localhost:3000/admin` loads Payload CMS admin
- [ ] `http://localhost:3000/api/auth/send-otp` responds to POST
