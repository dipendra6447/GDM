import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, users } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [job] = await db
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
      employerId: jobs.employerId,
      employerEmail: users.email,
    })
    .from(jobs)
    .innerJoin(users, eq(jobs.employerId, users.id))
    .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)))
    .limit(1);

  if (!job) {
    return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}

// PUT /api/jobs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const {
      title, description, companyName, location, salaryRange,
      jobType, workMode, experience, skills, category, education, benefits,
    } = await req.json();

    // Verify ownership
    const [existingJob] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!existingJob) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    if (existingJob.employerId !== userId && !authPayload.roles.includes(4)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const [job] = await db
      .update(jobs)
      .set({
        title, description, companyName, location, salaryRange,
        jobType, workMode, experience, skills, category, education, benefits,
      })
      .where(eq(jobs.id, id))
      .returning();

    return NextResponse.json({ success: true, message: 'Job updated', data: job });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Update job error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    }

    const isSuperUser = authPayload.roles.includes(4);
    if (job.employerId !== userId && !isSuperUser) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await db.update(jobs).set({ isDeleted: true }).where(eq(jobs.id, id));
    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Delete job error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to delete job' }, { status: 500 });
  }
}
