import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    identifier: varchar('identifier', { length: 255 }).notNull(), // Email address or Phone number
    type: varchar('type', { length: 20 }).notNull(),             // 'email' | 'phone'
    otpCode: varchar('otp_code', { length: 10 }).notNull(),       // 6-digit OTP code
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    identifierIdx: index('verification_identifier_idx').on(t.identifier),
    userIdIdx: index('verification_user_id_idx').on(t.userId),
  })
);
