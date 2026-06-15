# AGENTS.md — Nimnegah Course Platform

## Project Goal

Transform the existing artist portfolio (Next.js 15 SPA) into an online course-selling platform with:
- Admin panel for managing courses, users, and assets
- Student dashboard for watching courses
- OTP-based authentication (sms.ir)
- Payment processing (Zarinpal)
- Self-hosted on a VPS

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router + Turbopack) | Free |
| Language | TypeScript | Free |
| Styling | Tailwind CSS 4 | Free |
| Animations | Framer Motion | Free |
| Admin Panel | Payload CMS 3.x (embedded in Next.js) | Free (MIT) |
| Database | PostgreSQL 16 (self-hosted on VPS) | Free |
| ORM | Drizzle ORM | Free |
| Auth | OTP via sms.ir + Payload JWT sessions | ~219 تومان/SMS |
| Payments | Zarinpal (Node SDK) | 0.5% per transaction |
| Video Hosting | VPS disk + Nginx (self-hosted) | Free |
| File Storage | VPS disk (self-hosted) | Free |
| Caching | Redis (self-hosted on VPS) | Free |
| Reverse Proxy | Nginx + Let's Encrypt SSL | Free |
| Deployment | Docker Compose on VPS | ~$5-10/mo VPS |

**Total monthly cost: ~$5-10/mo (VPS only, everything else free)**

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Nginx                       │
│  SSL termination + reverse proxy            │
│  Serves /videos/ directly from disk         │
├─────────────────────────────────────────────┤
│              Docker Compose                  │
│  ├── nextjs-app (port 3000)                 │
│  ├── postgres (port 5432)                   │
│  └── redis (port 6379)                      │
├─────────────────────────────────────────────┤
│              Next.js App                     │
│  ├── (payload)/admin/*  → Payload CMS       │
│  ├── (frontend)/*       → Public pages      │
│  └── api/*              → Route handlers    │
├─────────────────────────────────────────────┤
│              VPS Disk                        │
│  ├── /var/data/postgres/  (DB files)        │
│  ├── /var/data/videos/    (course videos)   │
│  └── /var/data/uploads/   (images, PDFs)    │
└─────────────────────────────────────────────┘
```

## Data Models (Payload Collections)

### Users
```typescript
{
  id: number;
  phone: string;          // OTP login identifier, unique
  name: string;
  role: "admin" | "student";
  avatar: string;         // Media reference
  createdAt: Date;
  updatedAt: Date;
}
```

### Courses
```typescript
{
  id: number;
  title: string;
  slug: string;           // unique, auto-generated
  description: richText;  // Lexical editor
  price: number;          // in Tomans
  thumbnail: string;      // Media reference
  category: string;       // Category reference
  status: "draft" | "published";
  level: "beginner" | "intermediate" | "advanced";
  duration: number;       // total minutes
  lessonsCount: number;   // computed
  createdAt: Date;
  updatedAt: Date;
}
```

### Lessons
```typescript
{
  id: number;
  title: string;
  course: string;         // Course reference
  description: string;
  videoUrl: string;       // path on VPS disk (e.g., /videos/course-slug/lesson-1.mp4)
  duration: number;       // in seconds
  order: number;
  isFree: boolean;        // preview lesson
  createdAt: Date;
  updatedAt: Date;
}
```

### Categories
```typescript
{
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;      // Media reference
}
```

### Orders
```typescript
{
  id: number;
  user: string;           // User reference
  course: string;         // Course reference
  amount: number;         // Tomans
  status: "pending" | "completed" | "failed";
  zarinpalRefId: string;
  authority: string;      // Zarinpal authority
  createdAt: Date;
}
```

### Enrollments
```typescript
{
  id: number;
  user: string;           // User reference
  course: string;         // Course reference
  progress: number;       // 0-100 percentage
  enrolledAt: Date;
  lastAccessedAt: Date;
}
```

### Media
```typescript
{
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  filesize: number;
  alt: string;
}
```

### OTP Codes (temporary, auto-expiring)
```typescript
{
  id: number;
  phone: string;
  code: string;           // 6-digit
  expiresAt: Date;        // TTL: 5 minutes
}
```

## Routes

### Public Routes
| Route | Component | Description |
|---|---|---|
| `/` | AppWrapper (existing) | Portfolio landing page |
| `/courses` | CourseCatalog | Public course listing |
| `/courses/[slug]` | CourseDetail | Course info + purchase button |
| `/login` | LoginPhone | Enter phone number for OTP |
| `/verify` | LoginVerify | Enter OTP code |

### Protected Routes (Student)
| Route | Component | Description |
|---|---|---|
| `/dashboard` | StudentDashboard | My courses, progress overview |
| `/dashboard/[courseSlug]` | LessonViewer | Watch lessons, track progress |

### Admin Routes (Payload CMS)
| Route | Description |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/courses` | Course CRUD |
| `/admin/lessons` | Lesson CRUD |
| `/admin/users` | User management |
| `/admin/orders` | Order management |
| `/admin/categories` | Category CRUD |
| `/admin/media` | Media library |

### API Routes
| Route | Method | Description |
|---|---|---|
| `/api/auth/send-otp` | POST | Send OTP via sms.ir |
| `/api/auth/verify-otp` | POST | Verify OTP, return session |
| `/api/auth/me` | GET | Get current user from JWT |
| `/api/auth/logout` | POST | Clear session |
| `/api/payment/create` | POST | Create Zarinpal payment |
| `/api/payment/verify` | GET | Zarinpal callback verification |
| `/api/courses` | GET | List published courses |
| `/api/courses/[slug]` | GET | Get course with lessons |
| `/api/enrollment/check` | GET | Check if user is enrolled |
| `/api/progress` | POST | Update lesson progress |

## Auth Flow (OTP via sms.ir)

```
1. User enters phone → POST /api/auth/send-otp
   → Generate 6-digit code
   → Store in Redis with 5min TTL
   → Send via sms.ir API
   → Return success

2. User enters code → POST /api/auth/verify-otp
   → Check Redis for matching code
   → If valid: find/create user in DB
   → Issue JWT session cookie (Payload)
   → Return user data + redirect

3. Subsequent requests
   → Payload validates JWT cookie
   → Attach user to request context
   → Access control checks role
```

## Payment Flow (Zarinpal)

```
1. Student clicks "خرید دوره" → POST /api/payment/create
   → Verify user is authenticated
   → Create Order record (status: pending)
   → Call Zarinpal API to initialize payment
   → Return payment URL

2. Student redirected to bank page
   → Completes payment
   → Bank redirects to /api/payment/verify?Authority=xxx&Status=OK

3. /api/payment/verify callback
   → Verify payment with Zarinpal API
   → If successful:
     → Update Order status to "completed"
     → Create Enrollment record
     → Redirect to /dashboard/[courseSlug]
   → If failed:
     → Update Order status to "failed"
     → Redirect to /courses with error
```

## Video Serving

Videos are stored on VPS disk at `/var/data/videos/` and served via Nginx.

```
/var/data/videos/
├── course-slug-1/
│   ├── lesson-1.mp4
│   ├── lesson-2.mp4
│   └── lesson-3.mp4
└── course-slug-2/
    ├── lesson-1.mp4
    └── lesson-2.mp4
```

Nginx serves `/videos/` with auth validation:
- Unauthenticated requests to `/videos/` → 403
- Enrolled users get signed URLs (expire in 2 hours)
- Static assets (thumbnails) served from `/uploads/` publicly

## Docker Compose Services

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports: ["3000:3000"]
    env_file: .env
    volumes:
      - ./data/videos:/app/public/videos
      - ./data/uploads:/app/public/uploads

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: nimnegah
      POSTGRES_USER: nimnegah
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - ./data/redis:/data
    command: redis-server --appendonly yes
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://nimnegah:${DB_PASSWORD}@db:5432/nimnegah

# Redis (for OTP caching)
REDIS_URL=redis://redis:6379

# sms.ir
SMSIR_API_KEY=your-smsir-api-key
SMSIR_LINE_NUMBER=30007732000000
SMSIR_TEMPLATE_ID=12345

# Zarinpal
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true  # set false in production

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your-jwt-secret
```

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Install Payload CMS 3.x into Next.js app
- [ ] Set up Docker Compose (PostgreSQL + Redis)
- [ ] Configure Drizzle ORM with schema
- [ ] Define all Payload collections (Users, Courses, Lessons, etc.)
- [ ] Set up Nginx reverse proxy with SSL

### Phase 2: Authentication
- [ ] Implement sms.ir OTP helper (`src/lib/smsir.ts`)
- [ ] Create OTP send/verify API routes
- [ ] Configure Payload auth with phone-based login
- [ ] Add JWT session management
- [ ] Build login/verify UI pages

### Phase 3: Admin Panel
- [ ] Customize Payload admin dashboard
- [ ] Configure course CRUD with rich text editor
- [ ] Set up media library (uploads to VPS disk)
- [ ] Configure lesson management with video upload
- [ ] Add user management with role filters
- [ ] Add order management view

### Phase 4: Public Course Pages
- [ ] Build course catalog page (`/courses`)
- [ ] Build course detail page (`/courses/[slug]`)
- [ ] Add course filtering by category/level
- [ ] Show price, duration, lesson count

### Phase 5: Student Dashboard
- [ ] Build dashboard page (`/dashboard`)
- [ ] Show enrolled courses with progress bars
- [ ] Build lesson viewer (`/dashboard/[courseSlug]`)
- [ ] Implement video player with signed URLs
- [ ] Track lesson completion and progress

### Phase 6: Payments
- [ ] Implement Zarinpal helper (`src/lib/zarinpal.ts`)
- [ ] Create payment create/verify API routes
- [ ] Add purchase flow on course detail page
- [ ] Auto-enroll after successful payment

### Phase 7: Video Pipeline
- [ ] Set up video upload in admin panel
- [ ] Configure Nginx for video streaming
- [ ] Implement signed URL generation
- [ ] Add video progress tracking

### Phase 8: Polish & Deploy
- [ ] Error handling and loading states
- [ ] SEO metadata for course pages
- [ ] Responsive design audit
- [ ] Production Docker build optimization
- [ ] Set up automated backups (PostgreSQL + videos)
- [ ] Deploy to VPS

## File Structure (After Implementation)

```
src/
├── app/
│   ├── (payload)/
│   │   └── admin/
│   │       └── [[...segments]]/page.tsx
│   ├── (frontend)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # existing portfolio
│   │   ├── courses/
│   │   │   ├── page.tsx                # catalog
│   │   │   └── [slug]/page.tsx         # detail
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # my courses
│   │   │   └── [courseSlug]/page.tsx   # lesson viewer
│   │   ├── login/page.tsx
│   │   └── verify/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-otp/route.ts
│   │   │   ├── verify-otp/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   ├── payment/
│   │   │   ├── create/route.ts
│   │   │   └── verify/route.ts
│   │   └── (payload)/
│   │       └── [...payload]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── collections/
│   ├── Users.ts
│   ├── Courses.ts
│   ├── Lessons.ts
│   ├── Categories.ts
│   ├── Orders.ts
│   ├── Enrollments.ts
│   └── Media.ts
├── components/
│   ├── ui/                             # shared UI components
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── CourseCatalog.tsx
│   │   └── CourseDetail.tsx
│   ├── dashboard/
│   │   ├── StudentDashboard.tsx
│   │   ├── LessonViewer.tsx
│   │   └── VideoPlayer.tsx
│   ├── auth/
│   │   ├── LoginPhone.tsx
│   │   └── LoginVerify.tsx
│   └── (existing components)
├── lib/
│   ├── payload.ts                      # Payload config
│   ├── smsir.ts                        # sms.ir helper
│   ├── zarinpal.ts                     # Zarinpal helper
│   ├── auth.ts                         # JWT/session utils
│   ├── db.ts                           # Drizzle connection
│   └── fonts.ts                        # existing
├── data/                               # existing static data
├── hooks/
│   └── (existing hooks)
└── docker/
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx.conf
```

## Key Conventions

- All file paths in the codebase use the `@/*` alias mapping to `./src/*`
- Payload collections are defined in `src/collections/` (code-first, TypeScript)
- API routes use Next.js Route Handlers (`route.ts` files)
- UI components go in `src/components/` organized by feature
- Utility functions go in `src/lib/`
- Database queries use Drizzle ORM (SQL-like syntax, not Prisma-style)
- All amounts (prices) are in Tomans (Iranian currency)
- RTL layout is the default for Persian content
- Use Framer Motion for animations (already in project)
- Use Lucide React for icons (already in project)
