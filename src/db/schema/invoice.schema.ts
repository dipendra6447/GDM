import { pgTable, uuid, varchar, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { subscriptions } from './subscription.schema';

// ─── Invoices Table ───────────────────────────────────────────────────────────
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).unique().notNull(),
  amount: integer('amount').notNull(),         // Amount in Rupees (base price)
  tax: integer('tax').notNull(),               // Tax in Rupees (e.g. 18% GST)
  totalAmount: integer('total_amount').notNull(), // Total in Rupees (base + tax)
  billingName: varchar('billing_name', { length: 255 }).notNull(),
  billingEmail: varchar('billing_email', { length: 255 }).notNull(),
  billingAddress: varchar('billing_address', { length: 500 }),
  gstNumber: varchar('gst_number', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }).default('card').notNull(), // card, upi, net_banking
  paymentStatus: varchar('payment_status', { length: 50 }).default('paid').notNull(), // paid, pending, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('invoices_user_id_idx').on(t.userId),
  subscriptionIdIdx: index('invoices_subscription_id_idx').on(t.subscriptionId),
  invoiceNumberIdx: index('invoices_number_idx').on(t.invoiceNumber),
}));
