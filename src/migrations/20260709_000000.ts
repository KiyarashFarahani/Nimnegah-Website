import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_user_course_unique"
    ON "enrollments" USING btree ("user_id", "course_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "enrollments_user_course_unique";
  `)
}
