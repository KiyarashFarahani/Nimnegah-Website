import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/drizzle/postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ─── Courses: add courseType + spotplayerCourseIds ───────────────────────
  await db.execute(sql`
    ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "course_type" varchar DEFAULT 'self-hosted' NOT NULL,
      ADD COLUMN IF NOT EXISTS "spotplayer_course_ids" jsonb DEFAULT '[]'::jsonb;
  `)

  // ─── Lessons: replace video_url string with video_id FK to media ─────────
  // Check if video_url column exists (old schema) and video_id does not
  const hasVideoUrl = await db.execute(sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'video_url'
  `)
  const hasVideoId = await db.execute(sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'video_id'
  `)

  if (hasVideoUrl.rows.length > 0 && hasVideoId.rows.length === 0) {
    // Migrate data: copy video_url into a temp column, then drop and recreate
    await db.execute(sql`
      ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_id" integer;
    `)
    await db.execute(sql`
      ALTER TABLE "lessons"
        ADD CONSTRAINT "lessons_video_id_media_id_fk"
        FOREIGN KEY ("video_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "lessons_video_idx" ON "lessons" USING btree ("video_id");
    `)
    // Drop old video_url column
    await db.execute(sql`
      ALTER TABLE "lessons" DROP COLUMN IF EXISTS "video_url";
    `)
  } else if (hasVideoUrl.rows.length === 0 && hasVideoId.rows.length === 0) {
    // Neither exists — fresh install, just add video_id
    await db.execute(sql`
      ALTER TABLE "lessons"
        ADD COLUMN "video_id" integer,
        ADD CONSTRAINT "lessons_video_id_media_id_fk"
        FOREIGN KEY ("video_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "lessons_video_idx" ON "lessons" USING btree ("video_id");
    `)
  }
  // If video_id already exists, nothing to do

  // ─── Enrollments: add completedLessons + spotplayerLicenseKey ────────────
  await db.execute(sql`
    ALTER TABLE "enrollments"
      ADD COLUMN IF NOT EXISTS "completed_lessons" jsonb DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS "spotplayer_license_key" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "courses"
      DROP COLUMN IF EXISTS "course_type",
      DROP COLUMN IF EXISTS "spotplayer_course_ids";

    ALTER TABLE "lessons"
      DROP CONSTRAINT IF EXISTS "lessons_video_id_media_id_fk",
      DROP COLUMN IF EXISTS "video_id";

    ALTER TABLE "enrollments"
      DROP COLUMN IF EXISTS "completed_lessons",
      DROP COLUMN IF EXISTS "spotplayer_license_key";
  `)
}
