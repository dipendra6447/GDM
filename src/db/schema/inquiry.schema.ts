import { pgTable, uuid, varchar, timestamp, index, text } from 'drizzle-orm/pg-core';

// ─── Contact Inquiries & Quote Requests ──────────────────────────────────────
export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  serviceType: varchar('service_type', { length: 100 }).notNull().default('general'),
  budget: varchar('budget', { length: 100 }),
  timeline: varchar('timeline', { length: 100 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).default('new').notNull(), // 'new' | 'in_review' | 'contacted' | 'closed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('inquiries_email_idx').on(t.email),
  statusIdx: index('inquiries_status_idx').on(t.status),
  serviceTypeIdx: index('inquiries_service_type_idx').on(t.serviceType),
}));
