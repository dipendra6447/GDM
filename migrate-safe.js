import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  try {
    const rawSql = fs.readFileSync('drizzle/0001_clammy_switch.sql', 'utf-8');
    const statements = rawSql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await pool.query(stmt);
        console.log(`✅ Statement ${i + 1} succeeded.`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️ Statement ${i + 1} skipped (already exists).`);
        } else if (err.message.includes('multiple primary keys')) {
          console.log(`⚠️ Statement ${i + 1} skipped (primary key exists).`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    console.log("Migration script finished!");
  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    await pool.end();
  }
}
runMigrations();
