import { pgTable, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  employerId: uuid('employer_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  // New Fields
  slug: varchar('slug', { length: 300 }).unique(),
  companyName: varchar('company_name', { length: 255 }),
  location: varchar('location', { length: 255 }),
  salaryRange: varchar('salary_range', { length: 100 }),
  jobType: varchar('job_type', { length: 50 }),
  workMode: varchar('work_mode', { length: 50 }),
  experience: varchar('experience', { length: 100 }),
  skills: varchar('skills', { length: 1000 }),
  category: varchar('category', { length: 100 }),
  education: varchar('education', { length: 255 }),
  benefits: varchar('benefits', { length: 1000 }),
  
  // Soft Delete and Status
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  employerIdIdx: index('jobs_employer_id_idx').on(t.employerId),
  createdAtIndex: index('jobs_created_at_idx').on(t.createdAt),
}));

// ─── Job Applications ──────────────────────────────────────────────────────────
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .references(() => jobs.id)
    .notNull(),
  applicantId: uuid('applicant_id')
    .references(() => users.id)
    .notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  resumeUrl: varchar('resume_url', { length: 1000 }),
  resumeTitle: varchar('resume_title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  jobIdIdx: index('job_applications_job_id_idx').on(t.jobId),
  applicantIdIdx: index('job_applications_applicant_id_idx').on(t.applicantId),
}));

// ─── Saved Jobs (Wishlist) ─────────────────────────────────────────────────────
export const savedJobs = pgTable('saved_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  jobId: uuid('job_id')
    .references(() => jobs.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('saved_jobs_user_id_idx').on(t.userId),
  jobIdIdx: index('saved_jobs_job_id_idx').on(t.jobId),
  uniqueUserJob: index('saved_jobs_unique_user_job_idx').on(t.userId, t.jobId),
}));

// ─── Saved Searches ───────────────────────────────────────────────────────────
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  query: text('query').notNull(), // json or query string containing search filters
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index('saved_searches_user_id_idx').on(t.userId),
}));

