import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, isNull } from 'drizzle-orm';
import { subscriptions, subscriptionPlans } from './schema/subscription.schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function migrate() {
  console.log('🔄 Migrating existing subscriptions to link to new plans...');

  // Get all plans
  const allPlans = await db.select().from(subscriptionPlans);
  
  if (allPlans.length === 0) {
    console.error('❌ No plans found in DB. Please run the seed script first.');
    process.exit(1);
  }

  // Get existing subscriptions without planId
  const subs = await db.select().from(subscriptions).where(isNull(subscriptions.planId));
  
  console.log(`Found ${subs.length} subscriptions that need migration.`);

  let migrated = 0;
  let failed = 0;

  for (const sub of subs) {
    // Map legacy tiers to new tiers if necessary.
    // E.g., 'silver' -> 'plus', 'gold' -> 'premium' (or 'plus'), etc.
    let targetTier = sub.tier;
    if (targetTier.toLowerCase() === 'silver') targetTier = 'plus';
    if (targetTier.toLowerCase() === 'gold') targetTier = 'plus'; // Or premium based on spreadsheet, let's say plus.
    if (targetTier.toLowerCase() === 'platinum') targetTier = 'premium';
    
    // For business promoter, it might be different, but let's try direct mapping first.
    let plan = allPlans.find(p => p.roleTarget === sub.subscriptionType && p.tier === targetTier);
    
    if (!plan && targetTier === 'gold' && sub.subscriptionType === 'business_promoter') {
        plan = allPlans.find(p => p.roleTarget === sub.subscriptionType && p.tier === 'plus');
    }
    
    if (!plan) {
         plan = allPlans.find(p => p.roleTarget === sub.subscriptionType && p.tier === 'premium');
    }

    if (plan) {
      await db.update(subscriptions)
        .set({ planId: plan.id, tier: plan.tier })
        .where(eq(subscriptions.id, sub.id));
      migrated++;
    } else {
      console.warn(`⚠️ Could not find a matching plan for subscription: ${sub.id} (Type: ${sub.subscriptionType}, Tier: ${sub.tier})`);
      failed++;
    }
  }

  console.log(`\n🎉 Migration complete: ${migrated} migrated, ${failed} failed.\n`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
