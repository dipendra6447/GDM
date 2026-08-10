import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index';

const connectionString = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');

if (!connectionString) {
  console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!');
}

const sql = neon(connectionString || 'postgresql://placeholder:placeholder@localhost:5432/placeholder');

export const db = drizzle(sql, { schema });

export type DB = typeof db;


