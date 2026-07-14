import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, users, jobApplications } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/employer/me — Get all jobs posted by the authenticated employer
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const employerJobs = await db
      .select({
        id: jobs.id,
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
        applicantCount: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id})`,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.employerId, users.id))
      .where(and(eq(jobs.employerId, userId), eq(jobs.isDeleted, false)))
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json({ success: true, data: employerJobs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 });
  }
}
