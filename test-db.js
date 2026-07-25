import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://neondb_owner:npg_ERs6Dzr5eqHZ@ep-fragrant-field-atdjqv32-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
const db = drizzle(sql);

async function test() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "saved_searches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "query" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("Created table saved_searches");

    try {
      await sql`
        ALTER TABLE "saved_searches" 
        ADD CONSTRAINT "saved_searches_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      `;
      console.log("Added foreign key constraint");
    } catch (fkErr) {
      console.log("Foreign key constraint might already exist:", fkErr.message);
    }

    await sql`
      CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches" ("user_id");
    `;
    console.log("Created index");

    try {
      await sql`ALTER TABLE "employer_profiles" ADD COLUMN "benefits" text;`;
      console.log("Successfully added column 'benefits' to table 'employer_profiles'");
    } catch (colErr) {
      console.log("Column 'benefits' might already exist:", colErr.message);
    }

    const res = await sql`SELECT * FROM saved_searches LIMIT 1`;
    console.log("Success: saved_searches exists!", res);
  } catch (err) {
    console.error("DB Error:", err);
  }
}
test();
