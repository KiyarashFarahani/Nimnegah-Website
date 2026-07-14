# Nimnegah — Course Platform

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
| `/` | ✅ Done | landing, featured courses, about |
| `/courses` | ✅ Done | Public course catalog |
| `/courses/[slug]` | ✅ Done | Course detail + purchase |
| `/login` | ✅ Done | Phone number entry for OTP |
| `/verify` | ✅ Done | OTP code entry |
| `/complete-profile` | ✅ Done | New user profile completion |
| `/payment/success` | ✅ Done | Payment success page |
| `/payment/failed` | ✅ Done | Payment failure page |

### Student Dashboard

| Route | Status | Description |
|---|---|---|
| `/dashboard` | ✅ Done | Enrolled courses + progress |
| `/dashboard/learn/[slug]` | ✅ Done | Lesson viewer + video player |
| `/dashboard/profile` | ✅ Done | Student profile |

### Admin

| Route | Status | Description |
|---|---|---|
| `/admin` | ✅ Done | Payload CMS admin panel (courses, lessons, users, orders, media) |

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/send-otp` | POST | Send OTP via sms.ir |
| `/api/auth/verify-otp` | POST | Verify OTP + create session |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/update-profile` | POST | Update user profile |
| `/api/payment/create` | POST | Initialize Zarinpal payment |
| `/api/payment/verify` | GET | Zarinpal callback verification |
| `/api/dashboard/courses` | GET | Get enrolled courses |
| `/api/dashboard/enrollments` | GET | Get enrollment details |
| `/api/dashboard/progress` | POST | Update lesson progress |
| `/api/dashboard/generate-license` | POST | Generate SpotPlayer license |
| `/api/public/courses` | GET | List published courses |
| `/api/public/categories` | GET | List categories |
| `/api/video/[...path]` | GET | Video streaming with auth |
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
openssl rand -hex 16  # JWT_SECRET
openssl rand -hex 8   # DB_PASSWORD
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
| Auth | OTP via sms.ir + jose JWT |
| Payments | Zarinpal |
| Video Hosting | SpotPlayer (external) or self-hosted |
| Video Player | Plyr (plyr-react) |
| Icons | Lucide React |

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
│   │   ├── dashboard/          # Student API (courses, enrollments, progress, generate-license)
│   │   ├── public/             # Public API (courses, categories)
│   │   ├── video/              # Video streaming with auth
│   │   └── health/             # Health check endpoint
│   ├── layout.tsx              # Root layout (SEO metadata)
│   ├── robots.ts               # Dynamic robots.txt
│   └── sitemap.ts              # Dynamic sitemap.xml
├── collections/                # Payload collections
│   ├── Users.ts
│   ├── Courses.ts
│   ├── Lessons.ts
│   ├── Categories.ts
│   ├── Orders.ts
│   ├── Enrollments.ts
│   └── Media.ts
├── components/
│   ├── admin/                  # Admin panel components
│   ├── courses/                # Course catalog + detail
│   ├── dashboard/              # Dashboard shell + sidebar
│   ├── ui/                     # Shared UI components
│   ├── Hero.tsx                # Landing page sections
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── AppWrapper.tsx
│   ├── FeaturedCourses.tsx
│   ├── AboutAcademy.tsx
│   ├── CTA.tsx
│   ├── PageTransition.tsx
│   ├── ScrollToTopProvider.tsx
│   └── SplashScreen.tsx
├── contexts/
│   └── SplashContext.tsx       # Splash screen state
├── data/                       # Static content data
├── hooks/                      # Custom React hooks
├── lib/
│   ├── auth.ts                 # JWT/session utilities (jose)
│   ├── cookie.ts               # Cookie helpers
│   ├── course-utils.ts         # Course utility functions
│   ├── fonts.ts                # Font configuration
│   ├── redis.ts                # Redis client (ioredis)
│   ├── smsir.ts                # SMS provider
│   ├── spotplayer.ts           # SpotPlayer API
│   ├── validations.ts          # Input validation schemas
│   └── zarinpal.ts             # Payment provider
├── middleware.ts                # Next.js middleware (auth guards)
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
| `PAYLOAD_SECRET` | Payload CMS secret (32+ chars) |
| `JWT_SECRET` | JWT signing secret (32+ chars) |
| `SMSIR_API_KEY` | sms.ir API key |
| `SMSIR_LINE_NUMBER` | sms.ir sender number |
| `SMSIR_TEMPLATE_ID` | sms.ir template ID |
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID |
| `ZARINPAL_SANDBOX` | `true` for sandbox, `false` for production |
| `SPOTPLAYER_API_KEY` | SpotPlayer API key (from panel.spotplayer.ir) |
| `NEXT_PUBLIC_APP_URL` | App base URL |

## Deployment (VPS)

1. Copy `docker/Dockerfile`, `docker/docker-compose.yml`, and `docker/nginx.conf` to VPS
2. Update `nginx.conf`: replace `YOUR_DOMAIN` with your domain
3. Set up SSL: `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
4. Run `docker compose up -d` on the VPS
5. Health check: `curl https://yourdomain.com/api/health`

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
