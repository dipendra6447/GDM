import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function fix() {
  try {
    console.log("Adding missing columns...");
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000);`;
    console.log("Success! Columns added.");
  } catch (err) {
    console.error("DB Error:", err);
  }
}
fix();
