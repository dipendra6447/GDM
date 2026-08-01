import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log('🔄 Executing DB Migration for job_seeker_profiles...');
  const sql = neon(dbUrl);

  try {
    await sql`ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resume_title VARCHAR(255);`;
    console.log('✅ Added column: resume_title');

    await sql`ALTER TABLE job_seeker_profiles ADD COLUMN IF NOT EXISTS resumes JSONB DEFAULT '[]'::jsonb;`;
    console.log('✅ Added column: resumes');

    console.log('🎉 Migration completed successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration();
