import type { MigrateUpArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published', 'coming_soon');

   CREATE TABLE "products" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"title" varchar NOT NULL,
   	"slug" varchar,
   	"description" jsonb,
   	"price" numeric NOT NULL,
   	"original_price" numeric,
   	"thumbnail_id" integer,
   	"category_id" integer,
   	"status" "enum_products_status" DEFAULT 'draft',
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "product_files" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"alt" varchar,
    	"url" varchar,
    	"thumbnail_u_r_l" varchar,
   	"filename" varchar NOT NULL,
    	"mime_type" varchar NOT NULL,
   	"filesize" numeric NOT NULL,
   	"width" numeric,
   	"height" numeric,
    	"focal_x" numeric,
    	"focal_y" numeric,
   	"sizes" jsonb,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "product_purchases" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"user_id" integer NOT NULL,
   	"product_id" integer NOT NULL,
   	"order_id" integer,
   	"purchased_at" timestamp(3) with time zone,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE "products_rels" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"order" integer,
   	"parent_id" integer NOT NULL,
   	"path" varchar NOT NULL,
   	"product_files_id" integer
   );

   ALTER TABLE "orders" ALTER COLUMN "course_id" DROP NOT NULL;
   ALTER TABLE "orders" ADD COLUMN "product_id" integer;
   ALTER TABLE "coupons_rels" ADD COLUMN "products_id" integer;
   ALTER TYPE "public"."enum_coupons_scope" ADD VALUE 'products';

   ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "product_purchases" ADD CONSTRAINT "product_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "product_purchases" ADD CONSTRAINT "product_purchases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "product_purchases" ADD CONSTRAINT "product_purchases_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_files_fk" FOREIGN KEY ("product_files_id") REFERENCES "public"."product_files"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;

   CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
   CREATE INDEX "products_status_idx" ON "products" USING btree ("status");
   CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
   CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
   CREATE INDEX "products_thumbnail_idx" ON "products" USING btree ("thumbnail_id");
   CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
   CREATE INDEX "product_files_updated_at_idx" ON "product_files" USING btree ("updated_at");
   CREATE INDEX "product_files_created_at_idx" ON "product_files" USING btree ("created_at");
   CREATE UNIQUE INDEX "user_product_idx" ON "product_purchases" USING btree ("user_id","product_id");
   CREATE INDEX "product_purchases_updated_at_idx" ON "product_purchases" USING btree ("updated_at");
   CREATE INDEX "product_purchases_created_at_idx" ON "product_purchases" USING btree ("created_at");
   CREATE INDEX "product_purchases_user_idx" ON "product_purchases" USING btree ("user_id");
   CREATE INDEX "product_purchases_product_idx" ON "product_purchases" USING btree ("product_id");
   CREATE INDEX "product_purchases_order_idx" ON "product_purchases" USING btree ("order_id");
   CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
   CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
   CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
   CREATE INDEX "products_rels_product_files_id_idx" ON "products_rels" USING btree ("product_files_id");
   CREATE INDEX "orders_product_idx" ON "orders" USING btree ("product_id");
   CREATE INDEX "coupons_rels_products_id_idx" ON "coupons_rels" USING btree ("products_id");
  `)
}

export async function down(): Promise<void> {
  throw new Error('This migration contains product and purchase data and cannot be rolled back without data loss.')
}
