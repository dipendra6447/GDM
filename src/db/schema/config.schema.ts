import { pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

// ─── Global Config ────────────────────────────────────────────────────────────
export const globalConfigs = pgTable('global_configs', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull(),
});

// ─── Banner Images ────────────────────────────────────────────────────────────
export const bannerImages = pgTable('banner_images', {
  id: varchar('id', { length: 100 }).primaryKey(),
  url: text('url').notNull(),
  title: varchar('title', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

