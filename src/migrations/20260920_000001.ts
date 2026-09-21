import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "courses_status_idx" ON "courses" USING btree ("status");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "courses_status_idx";
  `)
}
