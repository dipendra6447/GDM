import { pgTable, uuid, varchar, timestamp, index, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// ─── Feature Entitlement Limits Type ──────────────────────────────────────────
// Stored as JSONB in subscription_plans.limits
// Each value is either a number (finite limit) or "unlimited"
export type PlanLimits = {
  jobApplications?: number | 'unlimited';
  jobPosts?: number | 'unlimited';
  savedJobs?: number | 'unlimited';
  featuredJobPosts?: number | 'unlimited';
  resumeDownloads?: number | 'unlimited';
  candidateSearch?: string;         // 'basic' | 'advanced' | 'unlimited'
  skillBasedSearch?: string;        // false | 'limited' | 'ai_powered'
  inviteCandidates?: number | 'unlimited';
  photoGallery?: number | 'unlimited';
  productListings?: number | 'unlimited';
  businessCategories?: number | 'unlimited';
  businessLocations?: number | 'unlimited';
  teamMembers?: number | 'unlimited';
  couponsOffers?: boolean;
  eventPromotions?: boolean;
  emailPromotions?: string;         // false | 'monthly' | 'unlimited'
};

// ─── Subscription Plans ────────────────────────────────────────────────────────
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),                             // Display name: "Free", "Plus", "Premium", "Basic"
  tier: varchar('tier', { length: 50 }).notNull(),                              // 'free' | 'basic' | 'plus' | 'premium'
  roleTarget: varchar('role_target', { length: 50 }).notNull(),                 // 'job_seeker' | 'job_poster' | 'business_promoter'
  dailyPrice: integer('daily_price').default(0).notNull(),                      // Price in ₹ per day
  weeklyPrice: integer('weekly_price').default(0).notNull(),                    // Price in ₹ per week
  monthlyPrice: integer('monthly_price').default(0).notNull(),                  // Price in ₹ per month
  features: jsonb('features').default('[]').notNull(),                          // string[] — list of feature labels for display
  limits: jsonb('limits').default('{}').notNull(),                              // PlanLimits — quantitative entitlements
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
  planId: uuid('plan_id')
    .references(() => subscriptionPlans.id),                                    // FK to specific plan purchased
  subscriptionType: varchar('subscription_type', { length: 50 }).notNull(),     // 'job_seeker' | 'job_poster' | 'business_promoter'
  tier: varchar('tier', { length: 50 }).notNull(),                              // 'free' | 'basic' | 'plus' | 'premium'
  billingCycle: varchar('billing_cycle', { length: 20 }).default('monthly').notNull(), // 'daily' | 'weekly' | 'monthly'
  status: varchar('status', { length: 20 }).default('active').notNull(),        // 'active' | 'expired' | 'cancelled'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(t.userId),
  typeStatusIdx: index('subscriptions_type_status_idx').on(t.subscriptionType, t.status),
  planIdIdx: index('subscriptions_plan_id_idx').on(t.planId),
}));
