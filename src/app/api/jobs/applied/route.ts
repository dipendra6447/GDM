import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobApplications, jobs } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/applied — Get all job applications for the authenticated job seeker
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const list = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        appliedAt: jobApplications.createdAt,
        jobId: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
        companyName: jobs.companyName,
        location: jobs.location,
        salaryRange: jobs.salaryRange,
        jobType: jobs.jobType,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobApplications.applicantId, userId))
      .orderBy(desc(jobApplications.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ GET applied jobs error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch applied jobs' }, { status: 500 });
  }
}
