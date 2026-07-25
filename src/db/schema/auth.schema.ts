import { pgTable, uuid, varchar, integer, timestamp, primaryKey, boolean, index } from 'drizzle-orm/pg-core';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }), // Made optional for OAuth users
  googleId: varchar('google_id', { length: 255 }).unique(), // Added for Google Login
  linkedinId: varchar('linkedin_id', { length: 255 }).unique(), // Added for LinkedIn Login
  avatarUrl: varchar('avatar_url', { length: 1000 }), // Useful for storing provider profile pics
  jobApplyCount: integer('job_apply_count').default(0).notNull(),
  jobPostCount: integer('job_post_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Roles ────────────────────────────────────────────────────────────────────
// 1 = job_seeker | 2 = job_poster | 3 = business_promoter | 4 = super_user
export const roles = pgTable('roles', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
});

// ─── User-Roles Junction ──────────────────────────────────────────────────────
export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  })
);

// ─── Password Reset Tokens ────────────────────────────────────────────────────
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('password_reset_user_id_idx').on(t.userId),
  tokenIdx: index('password_reset_token_idx').on(t.token),
}));
