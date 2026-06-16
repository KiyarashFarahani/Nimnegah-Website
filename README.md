# Nimnegah — Artist Portfolio + Course Platform

A Next.js 15 portfolio website integrated with Payload CMS 3.x for selling online courses. Features OTP-based auth, Zarinpal payments, and a self-hostable Docker setup.

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
| `/api/auth/*` | ✅ Done | OTP login endpoints (send-otp, verify-otp, me, logout) |
| `/api/payment/*` | ✅ Done | Zarinpal payment create + verify |
| `/courses` | 🔲 Next | Public course catalog |
| `/courses/[slug]` | 🔲 Next | Course detail + purchase |
| `/dashboard` | 🔲 Next | Student enrolled courses |
| `/dashboard/[courseSlug]` | 🔲 Next | Lesson viewer + video player |
| `/login` | 🔲 Next | Phone number entry |
| `/verify` | 🔲 Next | OTP code entry |

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
# db (PostgreSQL 16) — port 5432
# redis (Redis 7) — port 6379
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
| Animations | Framer Motion + Lenis |
| Auth | OTP via sms.ir + Payload JWT |
| Payments | Zarinpal |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/
│   ├── (payload)/              # Payload admin panel
│   │   ├── admin/[[...segments]]/page.tsx
│   │   ├── layout.tsx
│   │   └── importMap.js
│   ├── (frontend)/             # Portfolio pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── (payload)/          # Payload REST API
│   │   ├── auth/               # OTP auth routes
│   │   └── payment/            # Zarinpal routes
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── collections/                # Payload collections
│   ├── Users.ts
│   ├── Courses.ts
│   ├── Lessons.ts
│   ├── Categories.ts
│   ├── Orders.ts
│   ├── Enrollments.ts
│   └── Media.ts
├── components/                 # React components
├── data/                       # Static content data
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities
│   ├── redis.ts                # OTP caching
│   ├── smsir.ts                # SMS provider
│   └── zarinpal.ts             # Payment provider
└── docker/
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx.conf
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
| `PAYLOAD_SECRET` | Payload CMS secret (32+ chars) |
| `JWT_SECRET` | JWT signing secret (32+ chars) |
| `SMSIR_API_KEY` | sms.ir API key |
| `SMSIR_LINE_NUMBER` | sms.ir sender number |
| `SMSIR_TEMPLATE_ID` | sms.ir template ID |
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID |
| `ZARINPAL_SANDBOX` | `true` for sandbox, `false` for production |
| `NEXT_PUBLIC_APP_URL` | App base URL |

## Deployment (VPS)

1. Copy `docker/Dockerfile`, `docker/docker-compose.yml`, and `docker/nginx.conf` to VPS
2. Update `nginx.conf` with your domain + SSL cert paths
3. Run `docker compose up -d` on the VPS
4. Set up Let's Encrypt: `certbot --nginx -d yourdomain.com`

## License

MIT
