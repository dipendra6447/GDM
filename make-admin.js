import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function makeAdmin() {
  try {
    const userRes = await sql`SELECT id FROM users WHERE email = 'parikshit@email.com' LIMIT 1`;
    if (userRes.length > 0) {
      const userId = userRes[0].id;
      await sql`INSERT INTO user_roles (user_id, role_id) VALUES (${userId}, 4) ON CONFLICT DO NOTHING`;
      console.log("Success! Granted Super User (Role 4) to parikshit@email.com");
    }
  } catch (err) {
    console.error("DB Error:", err);
  }
}
makeAdmin();
