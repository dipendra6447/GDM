import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, desc, sql } from 'drizzle-orm';
import slugify from 'slugify';
import { db } from '@/db';
import { jobs, subscriptions, users, globalConfigs, employerProfiles } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// ─── Free Limit Cache ─────────────────────────────────────────────────────────
const configCache = new Map<string, { value: number; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getFreeLimit(key: string): Promise<number> {
  const now = Date.now();
  if (configCache.has(key) && configCache.get(key)!.expires > now) {
    return configCache.get(key)!.value;
  }
  const [config] = await db
    .select()
    .from(globalConfigs)
    .where(eq(globalConfigs.key, key))
    .limit(1);
  const value = config ? parseInt(config.value, 10) : 3;
  configCache.set(key, { value, expires: now + CACHE_TTL });
  return value;
}

// GET /api/jobs — List all active jobs (public)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(and(eq(jobs.isDeleted, false), eq(jobs.isActive, true)));

  const allJobs = await db
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
    .where(and(eq(jobs.isDeleted, false), eq(jobs.isActive, true)))
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ success: true, data: allJobs, meta: { page, limit, total: Number(count) } });
}

// POST /api/jobs — Create a new job (authenticated employer)
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const {
      title, description, companyName, location, salaryRange,
      jobType, workMode, experience, skills, category, education, benefits,
    } = await req.json();
    const userId = authPayload.userId;

    // Check for active job_poster subscription
    const activeSub = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.subscriptionType, 'job_poster'),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (activeSub.length === 0) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const freeLimit = await getFreeLimit('FREE_JOB_POST_LIMIT');

      if (user.jobPostCount >= freeLimit) {
        return NextResponse.json({
          success: false,
          message: `Free job post limit (${freeLimit}) reached. Subscribe to post more jobs.`,
        }, { status: 403 });
      }

      await db
        .update(users)
        .set({ jobPostCount: user.jobPostCount + 1 })
        .where(eq(users.id, userId));
    }

    // Fetch companyName if not provided
    let finalCompanyName = companyName;
    if (!finalCompanyName) {
      const [empProfile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1);
      if (empProfile && empProfile.companyName) {
        finalCompanyName = empProfile.companyName;
      }
    }

    const baseSlug = slugify(title, { lower: true, strict: true });
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const finalSlug = `${baseSlug}-${uniqueSuffix}`;

    const [job] = await db
      .insert(jobs)
      .values({
        employerId: userId,
        slug: finalSlug,
        title, description,
        companyName: finalCompanyName,
        location, salaryRange, jobType, workMode,
        experience, skills, category, education, benefits,
      })
      .returning();

    return NextResponse.json({ success: true, message: 'Job posted', data: job }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Account is deactivated or deleted') {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 });
    }
    console.error('❌ Create job error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to create job' }, { status: 500 });
  }
}
