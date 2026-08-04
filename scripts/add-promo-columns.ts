import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`ALTER TABLE "business_promotions" ALTER COLUMN "banner_url" SET DATA TYPE text`;
    console.log('✅ banner_url column type changed to text');
  } catch (err: any) {
    console.log('⏩ banner_url:', err.message?.substring(0, 80));
  }

  try {
    await sql`ALTER TABLE "business_promotions" ADD COLUMN IF NOT EXISTS "offer_tag" varchar(255)`;
    console.log('✅ offer_tag column added');
  } catch (err: any) {
    console.log('⏩ offer_tag:', err.message?.substring(0, 80));
  }

  try {
    await sql`ALTER TABLE "business_promotions" ADD COLUMN IF NOT EXISTS "cta_label" varchar(100) DEFAULT 'View Business'`;
    console.log('✅ cta_label column added');
  } catch (err: any) {
    console.log('⏩ cta_label:', err.message?.substring(0, 80));
  }

  console.log('\n✅ All migrations applied!');
  process.exit(0);
}

migrate();
