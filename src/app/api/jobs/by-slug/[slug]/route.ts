import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, users, employerProfiles, jobApplications } from '@/db/schema';

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
      companyAbout: employerProfiles.about,
      companyBenefits: employerProfiles.benefits,
      companyLogoUrl: employerProfiles.logoUrl,
      companySize: employerProfiles.companySize,
      companyFoundedYear: employerProfiles.foundedYear,
      companyHeadquarters: employerProfiles.headquarters,
      companyWebsiteUrl: employerProfiles.websiteUrl,
      companyLinkedinUrl: employerProfiles.linkedinUrl,
      companyTwitterUrl: employerProfiles.twitterUrl,
      companyIndustry: employerProfiles.industry,
    })
    .from(jobs)
    .innerJoin(users, eq(jobs.employerId, users.id))
    .leftJoin(employerProfiles, eq(employerProfiles.userId, jobs.employerId))
    .where(and(eq(jobs.slug, slug), eq(jobs.isDeleted, false)))
    .limit(1);

  if (!job) {
    return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
  }

  // Fetch applicant count
  const [appCountRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.jobId, job.id));
  const applicantCount = appCountRes ? Number(appCountRes.count) : 0;

  return NextResponse.json({ success: true, data: { ...job, applicantCount } });
}
