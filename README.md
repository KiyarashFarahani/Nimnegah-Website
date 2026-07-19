# Nimnegah Academy
A Next.js 15 course-selling platform with Payload CMS 3.x, OTP auth (sms.ir), Zarinpal payments, SpotPlayer video hosting, and self-hostable Docker setup.
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-ff0055?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwind-css)
## Pages
### Frontend
| Route | Status | Description |
|---|---|---|
| `/` | Done | Landing page with hero, featured courses, about section, contact |
| `/courses` | Done | Public course catalog |
| `/courses/[slug]` | Done | Course detail + purchase |
| `/login` | Done | Phone number entry for OTP |
| `/verify` | Done | OTP code entry |
| `/complete-profile` | Done | New user profile completion |
| `/payment/success` | Done | Payment success page |
| `/payment/failed` | Done | Payment failure page |
### Student Dashboard
| Route | Status | Description |
|---|---|---|
| `/dashboard` | Done | Enrolled courses + progress |
| `/dashboard/learn/[slug]` | Done | Lesson viewer + video player |
| `/dashboard/profile` | Done | Student profile |
### Admin
| Route | Status | Description |
|---|---|---|
| `/admin` | Done | Payload CMS admin panel (courses, lessons, users, orders, media) |
### API Routes
| Route | Method | Description |
|---|---|---|
| `/api/auth/send-otp` | POST | Send OTP via sms.ir (with rate limiting) |
| `/api/auth/verify-otp` | POST | Verify OTP + create session |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/update-profile` | POST | Update user profile |
| `/api/payment/create` | POST | Initialize Zarinpal payment |
| `/api/payment/verify` | GET | Zarinpal callback verification |
| `/api/dashboard/courses/[courseSlug]` | GET | Get enrolled course details |
| `/api/dashboard/enrollments` | GET | Get enrollment details |
| `/api/dashboard/progress` | POST | Update lesson progress |
| `/api/dashboard/generate-license` | POST | Generate SpotPlayer license |
| `/api/public/courses` | GET | List published courses |
| `/api/public/categories` | GET | List categories |
| `/api/video/[...path]` | GET | Video streaming with auth |
| `/api/system-stats` | GET | Server metrics (CPU, RAM, disk, DB counts) — admin only |
| `/api/health` | GET | Health check (DB + Redis) |
## Prerequisites
- **Node.js 22 LTS** (required by Payload 3.x — Node 26 is incompatible)
- Docker Desktop running
- npm
Install Node 22:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.zshrc
nvm install 22
nvm use 22
```
## Getting Started
### 1. Start databases (Docker)
```bash
docker compose -f docker/docker-compose.yml up -d
```
Verify:
```bash
docker compose -f docker/docker-compose.yml ps
# app    — Next.js app (port 3000)
# db     — PostgreSQL 16 (port 5432)
# redis  — Redis 7 (port 6379)
```
### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```
### 3. Configure environment
```bash
cp .env.example .env
```
Generate secrets:
```bash
openssl rand -hex 16  # PAYLOAD_SECRET
openssl rand -hex 8   # DB_PASSWORD
openssl rand -hex 8   # REDIS_PASSWORD
```
Update `.env` with the generated values. Ensure `DB_PASSWORD` matches the password in `DATABASE_URL`.
### 4. Run database migration
```bash
npx payload generate:types --disable-transpile
npx payload generate:importmap --disable-transpile
npx payload migrate --disable-transpile
```
### 5. Start dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the portfolio.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.
## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router + Turbopack) |
| CMS | Payload CMS 3.x (embedded) |
| Database | PostgreSQL 16 (Docker) |
| Cache | Redis 7 via ioredis (Docker) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Auth | OTP via sms.ir + Payload JWT (jose) |
| Payments | Zarinpal |
| Video Hosting | SpotPlayer (external) or self-hosted |
| Video Player | Plyr (plyr-react) |
| Icons | Lucide React |
| Testing | Vitest |
## Project Structure
```
src/
├── app/
│   ├── (payload)/              # Payload admin panel
│   │   └── admin/[[...segments]]/page.tsx
│   ├── (frontend)/             # Public pages
│   │   ├── courses/            # Course catalog + detail
│   │   ├── login/              # OTP login
│   │   ├── verify/             # OTP verification
│   │   ├── complete-profile/   # Profile completion
│   │   └── payment/            # Success/failure pages
│   ├── (dashboard)/            # Student area
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Enrolled courses
│   │   │   ├── learn/[slug]/   # Lesson viewer
│   │   │   └── profile/        # Student profile
│   │   └── complete-profile/   # Profile completion (dashboard variant)
│   ├── api/
│   │   ├── (payload)/          # Payload REST API
│   │   ├── auth/               # OTP auth routes (send-otp, verify-otp, me, logout, update-profile)
│   │   ├── payment/            # Zarinpal routes (create, verify)
│   │   ├── dashboard/          # Student API (courses/[courseSlug], enrollments, progress, generate-license)
│   │   ├── public/             # Public API (courses, categories)
│   │   ├── video/              # Video streaming with auth
│   │   ├── system-stats/       # Admin server metrics
│   │   └── health/             # Health check endpoint
│   ├── layout.tsx              # Root layout (SEO metadata, Vazirmatn font)
│   ├── robots.ts               # Dynamic robots.txt
│   └── sitemap.ts              # Dynamic sitemap.xml
├── collections/                # Payload collections (7 total)
│   ├── Users.ts                # OTP auth, role-based access
│   ├── Courses.ts              # With access control, slug generation, courseType
│   ├── Lessons.ts              # Video lessons with ordering
│   ├── Categories.ts           # Course categories
│   ├── Orders.ts               # Payment orders
│   ├── Enrollments.ts          # With progress, completedLessons, SpotPlayer license
│   └── Media.ts                # File uploads
├── components/
│   ├── admin/                  # Admin panel components
│   │   └── SystemStats.tsx     # Live server metrics dashboard
│   ├── courses/                # Course catalog + detail
│   │   ├── CourseCard.tsx
│   │   ├── CourseCatalog.tsx
│   │   └── CourseDetail.tsx
│   ├── dashboard/              # Dashboard shell + sidebar
│   │   ├── DashboardShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── VideoPlayer.tsx
│   ├── Hero.tsx                # Landing page sections
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── AppWrapper.tsx
│   ├── FeaturedCourses.tsx
│   ├── AboutAcademy.tsx
│   ├── ContactUs.tsx
│   ├── CTA.tsx
│   ├── PageTransition.tsx
│   ├── ScrollToTopProvider.tsx
│   └── SplashScreen.tsx
├── contexts/
│   └── SplashContext.tsx       # Splash screen state
├── data/
│   └── mock-courses.ts         # Static mock data
├── hooks/
│   ├── useAuth.ts              # Auth state hook
│   └── useSplashScreen.ts      # Splash screen hook
├── lib/
│   ├── auth.ts                 # JWT/session utilities (jose)
│   ├── cookie.ts               # Cookie helpers
│   ├── course-utils.ts         # Course utility functions
│   ├── fonts.ts                # Font configuration (Vazirmatn, custom font)
│   ├── redis.ts                # Redis client (ioredis) + OTP/rate-limit helpers
│   ├── smsir.ts                # SMS provider (sms.ir)
│   ├── spotplayer.ts           # SpotPlayer API
│   ├── validations.ts          # Input validation (Iranian phone, etc.)
│   └── zarinpal.ts             # Payment provider
├── middleware.ts                # Next.js middleware (auth guards for /dashboard)
├── migrations/                 # Database migrations
├── payload-generated-schema.ts # Auto-generated Payload schema
├── payload-types.ts            # Auto-generated Payload types
└── payload.config.ts           # Payload CMS configuration
docker/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── scripts/
    └── backup-db.sh            # Automated DB backup
```
## Scripts
```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest
npm run test:watch   # Run Vitest in watch mode
npm run payload      # Payload CLI
npm run payload:generate  # Regenerate types + importmap
npm run payload:migrate   # Run database migrations
```
## Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_PASSWORD` | PostgreSQL password |
| `REDIS_URL` | Redis connection string |
| `REDIS_PASSWORD` | Redis password (optional, for production) |
| `PAYLOAD_SECRET` | Payload CMS secret (32+ chars) — also used for JWT signing |
| `SMSIR_API_KEY` | sms.ir API key |
| `SMSIR_LINE_NUMBER` | sms.ir sender number |
| `SMSIR_TEMPLATE_ID` | sms.ir template ID |
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID |
| `ZARINPAL_SANDBOX` | `true` for sandbox, `false` for production |
| `SPOTPLAYER_API_KEY` | SpotPlayer API key (from panel.spotplayer.ir) |
| `NEXT_PUBLIC_APP_URL` | App base URL |
## Key Features
- **OTP Authentication** — Phone-based login via sms.ir with Redis-cached codes, rate limiting, and resend cooldown
- **Role-Based Access** — Admin and student roles with Payload collection-level access control
- **Payment Processing** — Zarinpal integration with order tracking and auto-enrollment
- **Video Hosting** — Self-hosted (VPS disk + auth) or SpotPlayer (license-based)
- **Admin Dashboard** — Live system stats (CPU, RAM, disk, DB/Redis metrics) in Payload admin
- **RTL Layout** — Full Persian/Arabic right-to-left support with Vazirmatn font
- **SEO** — Dynamic robots.txt, sitemap.xml, OpenGraph metadata
- **Middleware Auth** — Protected routes for `/dashboard` and `/api/dashboard`
## Deployment (VPS)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full VPS deployment guide.
### Automated Backups
The backup script runs daily via cron:
```bash
chmod +x docker/scripts/backup-db.sh
# Add to crontab:
0 3 * * * /path/to/project/docker/scripts/backup-db.sh
```
Backups are stored in `/var/backups/nimnegah/` with 30-day retention.
## License
MIT
