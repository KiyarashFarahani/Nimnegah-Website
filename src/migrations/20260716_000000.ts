import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_courses_status" ADD VALUE IF NOT EXISTS 'coming_soon';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // PostgreSQL doesn't support removing enum values directly.
  // To remove 'coming_soon', you'd need to recreate the type.
  // This is intentionally a no-op since the value is harmless if unused.
}
