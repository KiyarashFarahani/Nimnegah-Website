import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN "idempotency_key" varchar;
    CREATE UNIQUE INDEX "orders_authority_idx" ON "orders" USING btree ("authority");
    CREATE UNIQUE INDEX "orders_idempotency_key_idx" ON "orders" USING btree ("idempotency_key");
    CREATE UNIQUE INDEX "user_course_idx" ON "enrollments" USING btree ("user_id", "course_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "user_course_idx";
    DROP INDEX "orders_idempotency_key_idx";
    DROP INDEX "orders_authority_idx";
    ALTER TABLE "orders" DROP COLUMN "idempotency_key";
  `)
}
