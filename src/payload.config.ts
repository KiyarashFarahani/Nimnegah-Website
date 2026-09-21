import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users.ts'
import { Courses } from './collections/Courses.ts'
import { Lessons } from './collections/Lessons.ts'
import { Categories } from './collections/Categories.ts'
import { Orders } from './collections/Orders.ts'
import { Enrollments } from './collections/Enrollments.ts'
import { Media } from './collections/Media.ts'
import { Coupons } from './collections/Coupons.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    components: {
      afterDashboard: [
        {
          path: './src/components/admin/SystemStats.tsx#SystemStats',
        },
      ],
    },
  },
  collections: [
    Users,
    Courses,
    Lessons,
    Categories,
    Orders,
    Enrollments,
    Media,
    Coupons,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
      // Hard cap on concurrent DB connections for this process. Payload creates
      // exactly one pool per Node process, so this is the app-wide ceiling.
      // Keep this well below Postgres `max_connections` (leave headroom for
      // admin sessions, backups, and migrations).
      max: Number(process.env.DB_POOL_MAX ?? 20),
      // Recycle idle connections so the DB doesn't hold dead sockets.
      idleTimeoutMillis: 30_000,
      // Fail fast when the pool is saturated instead of hanging forever
      // (a hung acquire is what turns a burst into a multi-minute outage).
      connectionTimeoutMillis: 5_000,
      // Server-side: kill any single query that runs too long. This is the
      // key guard against one slow query pinning a connection indefinitely.
      statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 30_000),
      // Server-side: don't let a query wait forever on a lock.
      lock_timeout: Number(process.env.DB_LOCK_TIMEOUT_MS ?? 5_000),
      // Server-side: abort transactions left idle-in-transaction.
      idle_in_transaction_session_timeout: 10_000,
      // Client-side: abort the wait for a query result.
      query_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 30_000),
      keepAlive: true,
      application_name: 'nimnegah',
    },
  }),
})
