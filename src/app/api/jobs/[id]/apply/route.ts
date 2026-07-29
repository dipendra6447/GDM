import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { jobApplications, users } from '@/db/schema';
import { requireAuth, getAuthFromRequest } from '@/lib/auth';
import { canApplyToJob } from '@/lib/entitlements';

// GET /api/jobs/[id]/apply — Check if the user has already applied to this job
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await getAuthFromRequest(req);
    if (!authPayload || !authPayload.roles.includes(1)) {
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
    if (!authPayload.roles.includes(1)) {
      return NextResponse.json({ success: false, message: 'Employers are not allowed to apply for jobs.' }, { status: 403 });
    }
    const userId = authPayload.userId;

    // Check entitlements — uses subscription plan limits
    const check = await canApplyToJob(userId);
    if (!check.allowed) {
      return NextResponse.json({
        success: false,
        message: check.reason,
        upgradeRequired: check.upgradeRequired,
        currentUsage: check.currentUsage,
        limit: check.limit,
      }, { status: 403 });
    }

    // Increment usage counter if on free tier (not unlimited)
    if (check.limit !== 'unlimited') {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      await db.update(users).set({ jobApplyCount: (user?.jobApplyCount || 0) + 1 }).where(eq(users.id, userId));
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
