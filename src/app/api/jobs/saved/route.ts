import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { savedJobs, jobs } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/saved — Get all wishlisted jobs for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!authPayload.roles.includes(1)) {
      return NextResponse.json({ success: false, message: 'Employers do not have a saved jobs list.' }, { status: 403 });
    }
    const userId = authPayload.userId;

    const list = await db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
        description: jobs.description,
        companyName: jobs.companyName,
        location: jobs.location,
        salaryRange: jobs.salaryRange,
        jobType: jobs.jobType,
        workMode: jobs.workMode,
        experience: jobs.experience,
        skills: jobs.skills,
        category: jobs.category,
        education: jobs.education,
        benefits: jobs.benefits,
        isActive: jobs.isActive,
        createdAt: jobs.createdAt,
      })
      .from(savedJobs)
      .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .where(and(eq(savedJobs.userId, userId), eq(jobs.isDeleted, false)));

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ GET saved jobs error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

// POST /api/jobs/saved — Save a job to wishlist
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!authPayload.roles.includes(1)) {
      return NextResponse.json({ success: false, message: 'Employers are not allowed to save jobs.' }, { status: 403 });
    }
    const userId = authPayload.userId;
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ success: false, message: 'jobId is required' }, { status: 400 });
    }

    // Check if already saved
    const [existing] = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ success: true, message: 'Job already saved' });
    }

    await db.insert(savedJobs).values({ userId, jobId });
    return NextResponse.json({ success: true, message: 'Job saved to wishlist' }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ POST save job error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save job' }, { status: 500 });
  }
}
