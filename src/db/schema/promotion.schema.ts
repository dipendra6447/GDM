import { pgTable, uuid, varchar, timestamp, index, text } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { subscriptions } from './subscription.schema';

// ─── Business Promotions ──────────────────────────────────────────────────────
export const businessPromotions = pgTable('business_promotions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.id), // Nullable now, to support 'draft' state before subscription
  businessName: varchar('business_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }),
  businessDescription: text('business_description'),
  businessContactDetails: varchar('business_contact_details', { length: 255 }), // CTA Destination URL / Contact Link
  foundationDate: timestamp('foundation_date'),
  purpose: text('purpose'), // Campaign Tagline / Goal
  bannerUrl: text('banner_url'), // Comma-separated list of 1-3 uploaded collage image URLs
  offerTag: varchar('offer_tag', { length: 255 }), // e.g. "🔥 Free Consultation — Limited Slots"
  ctaLabel: varchar('cta_label', { length: 100 }).default('View Business'), // e.g. "View Business", "Book Free Session"
  status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft' | 'pending_approval' | 'active' | 'rejected' | 'expired'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('promotions_user_id_idx').on(t.userId),
  statusIdx: index('promotions_status_idx').on(t.status),
}));
