import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, users } from '@/db/schema';

// GET /api/jobs/by-slug/[slug]
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
    .where(and(eq(jobs.slug, slug), eq(jobs.isDeleted, false)))
    .limit(1);

  if (!job) {
    return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}
