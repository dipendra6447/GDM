import { pgTable, uuid, timestamp, index, integer, date } from 'drizzle-orm/pg-core';
import { businessPromotions } from './promotion.schema';

// ─── Ad Analytics Table ────────────────────────────────────────────────────────
export const adAnalytics = pgTable('ad_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  promotionId: uuid('promotion_id')
    .references(() => businessPromotions.id, { onDelete: 'cascade' })
    .notNull(),
  date: date('date').notNull(),
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  spent: integer('spent').default(0).notNull(), // Cost in Rupees
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  promotionIdIdx: index('ad_analytics_promotion_id_idx').on(t.promotionId),
  dateIdx: index('ad_analytics_date_idx').on(t.date),
}));
