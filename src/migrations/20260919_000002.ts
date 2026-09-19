import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX "status_createdAt_idx" ON "courses" USING btree ("status", "created_at");
    CREATE INDEX "course_order_idx" ON "lessons" USING btree ("course_id", "order");
    CREATE INDEX "user_lastAccessedAt_idx" ON "enrollments" USING btree ("user_id", "last_accessed_at");
    CREATE INDEX "coupon_status_idx" ON "orders" USING btree ("coupon_id", "status");
    CREATE INDEX "coupon_user_status_idx" ON "orders" USING btree ("coupon_id", "user_id", "status");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "coupon_user_status_idx";
    DROP INDEX "coupon_status_idx";
    DROP INDEX "user_lastAccessedAt_idx";
    DROP INDEX "course_order_idx";
    DROP INDEX "status_createdAt_idx";
  `)
}
