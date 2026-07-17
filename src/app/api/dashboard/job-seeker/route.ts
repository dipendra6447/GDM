import { NextRequest, NextResponse } from 'next/server';
import { eq, and, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { jobApplications, jobs, jobSeekerProfiles, users } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/dashboard/job-seeker
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [appCountResult] = await db.select({ count: count() }).from(jobApplications).where(eq(jobApplications.applicantId, userId));

    const statusCounts = await db
      .select({ status: jobApplications.status, count: count() })
      .from(jobApplications).where(eq(jobApplications.applicantId, userId)).groupBy(jobApplications.status);
    const statusMap: Record<string, number> = {};
    statusCounts.forEach(row => { statusMap[row.status] = row.count; });

    const recentApplications = await db
      .select({
        id: jobApplications.id, status: jobApplications.status, appliedAt: jobApplications.createdAt,
        jobTitle: jobs.title, companyName: jobs.companyName, location: jobs.location,
        salaryRange: jobs.salaryRange, jobType: jobs.jobType, jobId: jobs.id,
      })
      .from(jobApplications).innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobApplications.applicantId, userId))
      .orderBy(sql`${jobApplications.createdAt} DESC`).limit(5);

    const appliedJobIds = await db.select({ jobId: jobApplications.jobId }).from(jobApplications).where(eq(jobApplications.applicantId, userId));
    const appliedIds = appliedJobIds.map(a => a.jobId);

    let recommendedJobs;
    if (appliedIds.length > 0) {
      recommendedJobs = await db.select({
        id: jobs.id, slug: jobs.slug, title: jobs.title, companyName: jobs.companyName, location: jobs.location,
        salaryRange: jobs.salaryRange, jobType: jobs.jobType, workMode: jobs.workMode, category: jobs.category, createdAt: jobs.createdAt,
      }).from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.isDeleted, false),
        sql`${jobs.id} NOT IN (${sql.join(appliedIds.map(id => sql`${id}`), sql`, `)})`
      )).orderBy(sql`${jobs.createdAt} DESC`).limit(4);
    } else {
      recommendedJobs = await db.select({
        id: jobs.id, slug: jobs.slug, title: jobs.title, companyName: jobs.companyName, location: jobs.location,
        salaryRange: jobs.salaryRange, jobType: jobs.jobType, workMode: jobs.workMode, category: jobs.category, createdAt: jobs.createdAt,
      }).from(jobs).where(and(eq(jobs.isActive, true), eq(jobs.isDeleted, false))).orderBy(sql`${jobs.createdAt} DESC`).limit(4);
    }

    const skillsList = profile?.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6) : [];

    return NextResponse.json({
      success: true,
      data: {
        profile: profile || null,
        user: { email: user.email, createdAt: user.createdAt, avatarUrl: profile?.avatarUrl || null },
        stats: {
          totalApplications: appCountResult?.count || 0, pending: statusMap['pending'] || 0,
          reviewed: statusMap['reviewed'] || 0, interview: statusMap['interview'] || 0,
          rejected: statusMap['rejected'] || 0, accepted: statusMap['accepted'] || 0,
          profileCompletion: profile?.profileCompletion || 0,
        },
        skills: skillsList, recentApplications, recommendedJobs,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    console.error('❌ Dashboard error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
