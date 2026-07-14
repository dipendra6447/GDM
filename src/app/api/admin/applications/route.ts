import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobApplications, jobs, users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/applications
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const apps = await db
      .select({
        id: jobApplications.id, jobId: jobApplications.jobId, jobTitle: jobs.title,
        applicantId: jobApplications.applicantId, applicantEmail: users.email,
        status: jobApplications.status, appliedAt: jobApplications.createdAt,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(users, eq(jobApplications.applicantId, users.id))
      .orderBy(desc(jobApplications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ success: true, data: apps, meta: { page, limit } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch applications' }, { status: 500 });
  }
}
