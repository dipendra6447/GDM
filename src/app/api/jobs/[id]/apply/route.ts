import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { jobApplications, subscriptions, users, globalConfigs } from '@/db/schema';
import { requireAuth, getAuthFromRequest } from '@/lib/auth';

const configCache = new Map<string, { value: number; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60;

async function getFreeLimit(key: string): Promise<number> {
  const now = Date.now();
  if (configCache.has(key) && configCache.get(key)!.expires > now) {
    return configCache.get(key)!.value;
  }
  const [config] = await db.select().from(globalConfigs).where(eq(globalConfigs.key, key)).limit(1);
  const value = config ? parseInt(config.value, 10) : 3;
  configCache.set(key, { value, expires: now + CACHE_TTL });
  return value;
}

// GET /api/jobs/[id]/apply — Check if the user has already applied to this job
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await getAuthFromRequest(req);
    if (!authPayload) {
      return NextResponse.json({ success: true, applied: false });
    }
    const [existing] = await db
      .select()
      .from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.applicantId, authPayload.userId)))
      .limit(1);
    return NextResponse.json({ success: true, applied: !!existing });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to check application status', applied: false }, { status: 500 });
  }
}

// POST /api/jobs/[id]/apply
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    // Check active subscription or free limit
    const activeSub = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.subscriptionType, 'job_seeker'),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (activeSub.length === 0) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const freeLimit = await getFreeLimit('FREE_JOB_APPLY_LIMIT');

      if (user.jobApplyCount >= freeLimit) {
        return NextResponse.json({
          success: false,
          message: `Free job apply limit (${freeLimit}) reached. Subscribe to apply to more jobs.`,
        }, { status: 403 });
      }

      await db.update(users).set({ jobApplyCount: user.jobApplyCount + 1 }).where(eq(users.id, userId));
    }

    await db.insert(jobApplications).values({ jobId, applicantId: userId, status: 'pending' });

    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Apply error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to apply' }, { status: 500 });
  }
}
