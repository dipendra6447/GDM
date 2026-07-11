import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import slugify from 'slugify';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Adding slug column to jobs table...');
  try {
    await sql`ALTER TABLE jobs ADD COLUMN slug varchar(300) UNIQUE;`;
    console.log('Column added successfully.');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Column slug already exists. Proceeding to backfill...');
    } else {
      console.error('Error adding column:', err);
      process.exit(1);
    }
  }

  console.log('Fetching existing jobs with no slug...');
  const existingJobs = await sql`SELECT id, title FROM jobs WHERE slug IS NULL`;
  console.log(`Found ${existingJobs.length} jobs to backfill.`);

  for (const job of existingJobs) {
    const baseSlug = slugify(job.title, { lower: true, strict: true });
    const uniqueSuffix = crypto.randomBytes(2).toString('hex');
    const fullSlug = `${baseSlug}-${uniqueSuffix}`;
    
    await sql`UPDATE jobs SET slug = ${fullSlug} WHERE id = ${job.id}`;
    console.log(`Updated job ${job.id} -> ${fullSlug}`);
  }

  console.log('Migration and backfill complete!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
