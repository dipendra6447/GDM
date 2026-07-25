import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "token" varchar(255) NOT NULL UNIQUE,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('✅ password_reset_tokens table created');

    await sql`CREATE INDEX IF NOT EXISTS "password_reset_user_id_idx" ON "password_reset_tokens" ("user_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "password_reset_token_idx" ON "password_reset_tokens" ("token");`;
    console.log('✅ password_reset_tokens indexes created');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  }

  console.log('\n✅ Password reset database setup complete!');
  process.exit(0);
}

migrate();
