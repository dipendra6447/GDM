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

// PATCH /api/jobs/[id]/applicants — Update applicant status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json({ success: false, message: 'applicationId and status are required' }, { status: 400 });
    }

    // Verify ownership of the job
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }
    if (job.employerId !== userId && !authPayload.roles.includes(4)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Verify the application exists and is for this job
    const [app] = await db.select().from(jobApplications).where(eq(jobApplications.id, applicationId)).limit(1);
    if (!app || app.jobId !== jobId) {
      return NextResponse.json({ success: false, message: 'Application not found for this job' }, { status: 404 });
    }

    // Update status
    await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, applicationId));

    return NextResponse.json({ success: true, message: 'Applicant status updated successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ PATCH applicant status error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 500 });
  }
}

