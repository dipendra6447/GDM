ALTER TABLE "jobs" ADD COLUMN "slug" varchar(300);--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_slug_unique" UNIQUE("slug");