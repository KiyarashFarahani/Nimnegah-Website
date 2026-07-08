# Nimnegah — Artist Portfolio + Course Platform

A Next.js 15 portfolio website integrated with Payload CMS 3.x for selling online courses. Features OTP-based auth, Zarinpal payments, SpotPlayer video hosting, and a self-hostable Docker setup.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-ff0055?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## Pages

| Route | Status | Description |
|---|---|---|
| `/` | ✅ Done | Artist portfolio (landing, galleries, storyboards, characters, about, contact) |
| `/admin` | ✅ Done | Payload CMS admin panel (courses, lessons, users, orders, media) |
| `/courses` | ✅ Done | Public course catalog |
| `/courses/[slug] | ✅ Done | Course detail + purchase |
| `/login` | ✅ Done | Phone number entry for OTP |
| `/verify` | ✅ Done | OTP code entry |
| `/dashboard` | ✅ Done | Student enrolled courses + progress |
| `/dashboard/learn/[slug]` | ✅ Done | Lesson viewer + video player |
| `/dashboard/profile` | ✅ Done | Student profile |
| `/payment/success` | ✅ Done | Payment success page |
| `/payment/failed` | ✅ Done | Payment failure page |
| `/api/auth/*` | ✅ Done | OTP login endpoints (send-otp, verify-otp, me, logout) |
| `/api/payment/*` | ✅ Done | Zarinpal payment create + verify |
| `/api/health` | ✅ Done | Health check endpoint (DB + Redis) |

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
| Cache | Redis 7 (Docker) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Auth | OTP via sms.ir + Payload JWT |
| Payments | Zarinpal |
| Video Hosting | SpotPlayer (external) or self-hosted |
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
│   │   ├── payment/            # Success/failure pages
│   │   └── complete-profile/   # Profile completion
│   ├── (dashboard)/            # Student dashboard
│   │   └── dashboard/
│   │       ├── page.tsx        # Enrolled courses
│   │       ├── learn/[slug]/   # Lesson viewer
│   │       └── profile/        # Student profile
│   ├── api/
│   │   ├── (payload)/          # Payload REST API
│   │   ├── auth/               # OTP auth routes
│   │   ├── payment/            # Zarinpal routes
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
│   ├── courses/                # Course catalog + detail
│   ├── dashboard/              # Dashboard shell + sidebar
│   └── ui/                     # Shared UI components
├── data/                       # Static content data
├── hooks/                      # Custom React hooks
├── lib/
│   ├── redis.ts                # OTP caching
│   ├── smsir.ts                # SMS provider
│   ├── spotplayer.ts           # SpotPlayer API
│   └── zarinpal.ts             # Payment provider
├── migrations/                 # Database migrations
└── docker/
    ├── Dockerfile
    ├── docker-compose.yml
    ├── nginx.conf
    └── scripts/
        └── backup-db.sh        # Automated DB backup
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

See [`.env.example`](.env.example) for the full list.

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
