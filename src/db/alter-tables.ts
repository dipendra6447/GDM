import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function alterTables() {
  console.log('🔄 Altering tables...');

  try {
    // Drop existing table to ensure schema matches
    await sql`DROP TABLE IF EXISTS "subscription_plans" CASCADE;`;

    await sql`
      CREATE TABLE "subscription_plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(100) NOT NULL,
        "role_target" varchar(50) NOT NULL,
        "tier" varchar(50) NOT NULL,
        "daily_price" numeric(10, 2) NOT NULL,
        "weekly_price" numeric(10, 2) NOT NULL,
        "monthly_price" numeric(10, 2) NOT NULL,
        "features" jsonb DEFAULT '[]'::jsonb,
        "limits" jsonb DEFAULT '{}'::jsonb,
        "is_active" boolean DEFAULT true,
        "is_popular" boolean DEFAULT false,
        "is_best_value" boolean DEFAULT false,
        "image_url" text,
        "is_deleted" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;
    console.log('✅ subscription_plans created/verified.');

    // Add plan_id and billing_cycle to subscriptions
    await sql`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "plan_id" uuid;`;
    await sql`ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billing_cycle" varchar(20) DEFAULT 'monthly' NOT NULL;`;
    
    // Add constraint if not exists
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_plan_id_subscription_plans_id_fk'
        ) THEN
          ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id");
        END IF;
      END;
      $$;
    `;
    
    console.log('✅ subscriptions table altered with plan_id and billing_cycle.');

    console.log('\n🎉 DB alteration complete!\n');
  } catch (error) {
    console.error('❌ Alteration failed:', error);
  }
}

alterTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
