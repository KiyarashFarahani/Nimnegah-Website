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
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
})
