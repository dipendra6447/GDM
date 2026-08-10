import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log('🔄 Executing DB Migration for job_applications...');
  const sql = neon(dbUrl);

  try {
    await sql`ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_url VARCHAR(1000);`;
    console.log('✅ Added column: resume_url to job_applications');

    await sql`ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_title VARCHAR(255);`;
    console.log('✅ Added column: resume_title to job_applications');

    console.log('🎉 Migration completed successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration();
