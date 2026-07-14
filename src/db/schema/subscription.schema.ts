import { pgTable, uuid, varchar, timestamp, index, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// ─── Subscription Plans ────────────────────────────────────────────────────────
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: integer('price').notNull(),
  billingCycle: varchar('billing_cycle', { length: 50 }).default('/month').notNull(),
  roleTarget: varchar('role_target', { length: 50 }).notNull(), // 'job_seeker' | 'job_poster' | 'business_promoter'
  features: jsonb('features').default('[]').notNull(),
  imageUrl: varchar('image_url', { length: 1000 }),
  isPopular: boolean('is_popular').default(false).notNull(),
  isBestValue: boolean('is_best_value').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Subscriptions (User Instances) ───────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  subscriptionType: varchar('subscription_type', { length: 50 }).notNull(), // 'job_seeker' | 'job_poster' | 'business_promoter'
  tier: varchar('tier', { length: 20 }).notNull(),                          // 'daily' | 'weekly' | 'monthly'
  status: varchar('status', { length: 20 }).default('active').notNull(),    // 'active' | 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(t.userId),
  typeStatusIdx: index('subscriptions_type_status_idx').on(t.subscriptionType, t.status),
}));
