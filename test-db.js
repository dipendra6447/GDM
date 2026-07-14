import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://neondb_owner:npg_ERs6Dzr5eqHZ@ep-fragrant-field-atdjqv32-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
const db = drizzle(sql);

async function test() {
  try {
    const res = await sql`SELECT * FROM users LIMIT 1`;
    console.log("Success:", res);
  } catch (err) {
    console.error("DB Error:", err);
  }
}
test();
