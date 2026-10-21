import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "products_id" integer,
      ADD COLUMN IF NOT EXISTS "product_files_id" integer,
      ADD COLUMN IF NOT EXISTS "product_purchases_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_products_id_idx"
      ON "payload_locked_documents_rels" USING btree ("products_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_product_files_id_idx"
      ON "payload_locked_documents_rels" USING btree ("product_files_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_product_purchases_id_idx"
      ON "payload_locked_documents_rels" USING btree ("product_purchases_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_products_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_products_fk"
          FOREIGN KEY ("products_id") REFERENCES "public"."products"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_product_files_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_product_files_fk"
          FOREIGN KEY ("product_files_id") REFERENCES "public"."product_files"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_product_purchases_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_product_purchases_fk"
          FOREIGN KEY ("product_purchases_id") REFERENCES "public"."product_purchases"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_products_fk",
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_files_fk",
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_purchases_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_products_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_product_files_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_product_purchases_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "products_id",
      DROP COLUMN IF EXISTS "product_files_id",
      DROP COLUMN IF EXISTS "product_purchases_id";
  `)
}
