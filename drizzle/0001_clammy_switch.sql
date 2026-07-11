CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"billing_cycle" varchar(50) DEFAULT '/month' NOT NULL,
	"role_target" varchar(50) NOT NULL,
	"features" jsonb DEFAULT '[]' NOT NULL,
	"image_url" varchar(1000),
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_best_value" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_categories" ADD COLUMN "image_url" varchar(1000);--> statement-breakpoint
ALTER TABLE "job_categories" ADD COLUMN "image_url" varchar(1000);