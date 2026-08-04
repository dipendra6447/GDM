CREATE TABLE "ad_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promotion_id" uuid NOT NULL,
	"date" date NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"spent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"tax" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"billing_name" varchar(255) NOT NULL,
	"billing_email" varchar(255) NOT NULL,
	"billing_address" varchar(500),
	"gst_number" varchar(50),
	"payment_method" varchar(50) DEFAULT 'card' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'paid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
ALTER TABLE "business_promotions" ALTER COLUMN "banner_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "business_promotions" ADD COLUMN "offer_tag" varchar(255);--> statement-breakpoint
ALTER TABLE "business_promotions" ADD COLUMN "cta_label" varchar(100) DEFAULT 'View Business';--> statement-breakpoint
ALTER TABLE "ad_analytics" ADD CONSTRAINT "ad_analytics_promotion_id_business_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."business_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_analytics_promotion_id_idx" ON "ad_analytics" USING btree ("promotion_id");--> statement-breakpoint
CREATE INDEX "ad_analytics_date_idx" ON "ad_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_subscription_id_idx" ON "invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "invoices_number_idx" ON "invoices" USING btree ("invoice_number");