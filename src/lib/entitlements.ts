/**
 * Entitlements Engine
 * 
 * Centralized feature access and limits checking based on the user's
 * active subscription plan. Used by API routes to enforce plan-based
 * restrictions.
 */

import { eq, and, gt, or } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, subscriptionPlans, users } from '@/db/schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserEntitlements {
  tier: string;                 // 'free' | 'basic' | 'plus' | 'premium'
  planName: string;             // Display name
  roleTarget: string;           // 'job_seeker' | 'job_poster' | 'business_promoter'
  features: string[];           // List of feature labels
  limits: Record<string, any>;  // Quantitative limits
  subscriptionId?: string;      // Active subscription ID (if any)
  expiresAt?: Date;             // Subscription expiry
}

export interface AccessCheck {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number | 'unlimited';
  upgradeRequired?: boolean;
}

// ─── Free Tier Defaults ───────────────────────────────────────────────────────

const FREE_JOB_SEEKER_LIMITS: Record<string, any> = {
  jobApplications: 10,
  savedJobs: 20,
  jobAlerts: 'basic',
  companyReviews: 'limited',
  applicationTracker: 'basic',
  interviewPrep: 'basic',
  resumeVisibility: 'standard',
  recruiterVisibility: 'standard',
  salaryInsights: false,
  earlyAccessJobs: false,
  downloadCertificates: false,
};

const FREE_EMPLOYER_LIMITS: Record<string, any> = {
  jobPosts: 3,
  featuredJobPosts: 0,
  candidateSearch: 'basic',
  resumeDownloads: 10,
  skillBasedSearch: 'limited',
  inviteCandidates: 20,
  applicantTracking: 'basic',
  resumeShortlisting: 'manual',
  videoInterview: 'limited',
  candidatePipeline: 'basic',
  analyticsDashboard: 'basic',
  recruiterBadge: false,
  aiCandidateMatching: false,
};

// ─── Core: Resolve User Entitlements ──────────────────────────────────────────

export async function getUserEntitlements(
  userId: string,
  role: 'job_seeker' | 'job_poster' | 'business_promoter'
): Promise<UserEntitlements> {
  try {
    // Find active subscription for this user + role
    const activeSubResults = await db
      .select({
        subId: subscriptions.id,
        subTier: subscriptions.tier,
        subExpiresAt: subscriptions.expiresAt,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
        planTier: subscriptionPlans.tier,
        planFeatures: subscriptionPlans.features,
        planLimits: subscriptionPlans.limits,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.subscriptionType, role),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (activeSubResults.length > 0) {
      const sub = activeSubResults[0];
      return {
        tier: sub.planTier || sub.subTier || 'free',
        planName: sub.planName || sub.subTier || 'Free',
        roleTarget: role,
        features: (sub.planFeatures as string[]) || [],
        limits: (sub.planLimits as Record<string, any>) || {},
        subscriptionId: sub.subId,
        expiresAt: sub.subExpiresAt,
      };
    }

    // No active subscription — return free tier defaults
    const defaultLimits = role === 'job_seeker'
      ? FREE_JOB_SEEKER_LIMITS
      : role === 'job_poster'
        ? FREE_EMPLOYER_LIMITS
        : {}; // Business promoter has no free tier

    return {
      tier: 'free',
      planName: 'Free',
      roleTarget: role,
      features: [],
      limits: defaultLimits,
      subscriptionId: undefined,
      expiresAt: undefined,
    };
  } catch (error) {
    console.error('Failed to get user entitlements:', error);
    // Fail-open to free tier on error
    return {
      tier: 'free',
      planName: 'Free',
      roleTarget: role,
      features: [],
      limits: role === 'job_seeker' ? FREE_JOB_SEEKER_LIMITS : FREE_EMPLOYER_LIMITS,
    };
  }
}

// ─── Convenience: Can Apply to Job ────────────────────────────────────────────

export async function canApplyToJob(userId: string): Promise<AccessCheck> {
  const entitlements = await getUserEntitlements(userId, 'job_seeker');
  const limit = entitlements.limits.jobApplications;

  // Unlimited for paid plans
  if (limit === 'unlimited') {
    return { allowed: true, limit: 'unlimited' };
  }

  // Check current usage from users table
  const [user] = await db.select({ jobApplyCount: users.jobApplyCount }).from(users).where(eq(users.id, userId)).limit(1);
  const currentUsage = user?.jobApplyCount || 0;
  const numericLimit = typeof limit === 'number' ? limit : 10; // default 10

  if (currentUsage >= numericLimit) {
    return {
      allowed: false,
      reason: `Free job application limit (${numericLimit}) reached. Upgrade to Plus or Premium for unlimited applications.`,
      currentUsage,
      limit: numericLimit,
      upgradeRequired: true,
    };
  }

  return { allowed: true, currentUsage, limit: numericLimit };
}

// ─── Convenience: Can Post Job ────────────────────────────────────────────────

export async function canPostJob(userId: string): Promise<AccessCheck> {
  const entitlements = await getUserEntitlements(userId, 'job_poster');
  const limit = entitlements.limits.jobPosts;

  // Unlimited for premium
  if (limit === 'unlimited') {
    return { allowed: true, limit: 'unlimited' };
  }

  // Check current usage from users table
  const [user] = await db.select({ jobPostCount: users.jobPostCount }).from(users).where(eq(users.id, userId)).limit(1);
  const currentUsage = user?.jobPostCount || 0;
  const numericLimit = typeof limit === 'number' ? limit : 3; // default 3

  if (currentUsage >= numericLimit) {
    return {
      allowed: false,
      reason: `Free job posting limit (${numericLimit}) reached. Upgrade to Plus or Premium for more job posts.`,
      currentUsage,
      limit: numericLimit,
      upgradeRequired: true,
    };
  }

  return { allowed: true, currentUsage, limit: numericLimit };
}

// ─── Convenience: Can Promote Business ────────────────────────────────────────

export async function canPromoteBusiness(userId: string): Promise<AccessCheck> {
  const entitlements = await getUserEntitlements(userId, 'business_promoter');

  // Business promoter has no free tier — must have active subscription
  if (entitlements.tier === 'free' || !entitlements.subscriptionId) {
    return {
      allowed: false,
      reason: 'Business promotion requires an active subscription. Choose a Basic, Plus, or Premium plan.',
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

// ─── Convenience: Get Feature Access ──────────────────────────────────────────

export async function getFeatureAccess(
  userId: string,
  role: 'job_seeker' | 'job_poster' | 'business_promoter',
  feature: string
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId, role);
  return entitlements.features.some(
    f => f.toLowerCase().includes(feature.toLowerCase())
  );
}

// ─── Convenience: Get Limit Value ─────────────────────────────────────────────

export async function getLimit(
  userId: string,
  role: 'job_seeker' | 'job_poster' | 'business_promoter',
  limitKey: string
): Promise<number | 'unlimited'> {
  const entitlements = await getUserEntitlements(userId, role);
  const value = entitlements.limits[limitKey];
  if (value === 'unlimited') return 'unlimited';
  if (typeof value === 'number') return value;
  return 0;
}
