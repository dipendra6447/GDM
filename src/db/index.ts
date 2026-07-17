// Patch DNS lookup to force IPv4 and prevent Neon HTTP fetch connection timeouts (IPv6 issues)
if (typeof window === 'undefined') {
  try {
    const dns = require('dns');
    const originalLookup = dns.lookup;
    dns.lookup = function(hostname: any, options: any, callback: any) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options = options || {};
      options.family = 4;
      return originalLookup.call(dns, hostname, options, callback);
    };
  } catch (e) {
    // Ignore in non-Node environments (like Edge or browser compilation passes)
  }
}

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type DB = typeof db;
