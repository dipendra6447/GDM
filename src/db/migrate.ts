import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('🚀 Running database schema migrations...');
  const sql = neon(dbUrl);

  try {
    // 1. Add phone, is_email_verified, and is_phone_verified to users table if they don't exist
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(20);`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_phone_verified" boolean DEFAULT false NOT NULL;`;
    console.log('✅ Updated "users" table columns (phone, is_email_verified, is_phone_verified).');

    // 2. Create verification_tokens table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "identifier" varchar(255) NOT NULL,
        "type" varchar(20) NOT NULL,
        "otp_code" varchar(10) NOT NULL,
        "expires_at" timestamp NOT NULL,
        "is_used" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('✅ Created "verification_tokens" table.');

    // 3. Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification_tokens" ("identifier");`;
    await sql`CREATE INDEX IF NOT EXISTS "verification_user_id_idx" ON "verification_tokens" ("user_id");`;
    console.log('✅ Created indexes on "verification_tokens".');

    console.log('\n🎉 Database migration completed successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
