import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, jobApplications, users, jobSeekerProfiles } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/[id]/applicants
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    // Verify ownership of the job
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    if (job.employerId !== userId && !authPayload.roles.includes(4)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Fetch applicants
    const applicants = await db
      .select({
        id: jobApplications.id,
        applicantId: jobApplications.applicantId,
        status: jobApplications.status,
        appliedAt: jobApplications.createdAt,
        firstName: jobSeekerProfiles.firstName,
        lastName: jobSeekerProfiles.lastName,
        email: users.email,
      })
      .from(jobApplications)
      .innerJoin(users, eq(jobApplications.applicantId, users.id))
      .leftJoin(jobSeekerProfiles, eq(jobApplications.applicantId, jobSeekerProfiles.userId))
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.createdAt));

    return NextResponse.json({ success: true, data: applicants });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch applicants' }, { status: 500 });
  }
}
