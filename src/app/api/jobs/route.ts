import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import slugify from 'slugify';
import { db } from '@/db';
import { jobs, users, employerProfiles } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { canPostJob } from '@/lib/entitlements';

// GET /api/jobs — List all active jobs (public)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    // Extract filters
    const locationFilter = searchParams.get('location');
    const jobTypeFilter = searchParams.get('jobType');
    const categoryFilter = searchParams.get('category');
    const searchKeyword = searchParams.get('keyword');

    const conditions = [eq(jobs.isDeleted, false), eq(jobs.isActive, true)];

    if (locationFilter && locationFilter !== 'all') {
      conditions.push(sql`LOWER(${jobs.location}) LIKE ${'%' + locationFilter.toLowerCase() + '%'}`);
    }
    if (jobTypeFilter && jobTypeFilter !== 'all') {
      conditions.push(sql`LOWER(${jobs.jobType}) = ${jobTypeFilter.toLowerCase()}`);
    }
    if (categoryFilter && categoryFilter !== 'all') {
      conditions.push(eq(jobs.category, categoryFilter));
    }
    if (searchKeyword) {
      const cleanKeyword = searchKeyword.trim().toLowerCase();
      const terms = cleanKeyword.split(/\s+/).filter(Boolean);
      const normalizedPhrase = cleanKeyword.replace(/[\s\.]/g, '');
      
      if (terms.length > 0) {
        let sqlFragment = sql`(`;
        
        // 1. Full phrase match (in title, description, or skills)
        sqlFragment = sql`${sqlFragment} (LOWER(${jobs.title}) LIKE ${'%' + cleanKeyword + '%'} OR LOWER(${jobs.description}) LIKE ${'%' + cleanKeyword + '%'} OR LOWER(${jobs.skills}) LIKE ${'%' + cleanKeyword + '%'})`;
        
        // 2. Normalized phrase match (e.g., "react js" -> "reactjs")
        if (normalizedPhrase !== cleanKeyword) {
          sqlFragment = sql`${sqlFragment} OR (LOWER(${jobs.title}) LIKE ${'%' + normalizedPhrase + '%'} OR LOWER(${jobs.description}) LIKE ${'%' + normalizedPhrase + '%'} OR LOWER(${jobs.skills}) LIKE ${'%' + normalizedPhrase + '%'})`;
        }
        
        // 3. Individual terms matching
        terms.forEach(term => {
          if (term.length > 1) { // ignore single letters
            sqlFragment = sql`${sqlFragment} OR (LOWER(${jobs.title}) LIKE ${'%' + term + '%'} OR LOWER(${jobs.description}) LIKE ${'%' + term + '%'} OR LOWER(${jobs.skills}) LIKE ${'%' + term + '%'})`;
          }
        });
        
        sqlFragment = sql`${sqlFragment})`;
        conditions.push(sqlFragment);
      }
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions));

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
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ success: true, data: allJobs, meta: { page, limit, total: Number(count) } });
  } catch (error: any) {
    console.error('❌ GET /api/jobs Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs', data: [] }, { status: 500 });
  }
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

    // Check entitlements — uses subscription plan limits
    const check = await canPostJob(userId);
    if (!check.allowed) {
      return NextResponse.json({
        success: false,
        message: check.reason,
        upgradeRequired: check.upgradeRequired,
        currentUsage: check.currentUsage,
        limit: check.limit,
      }, { status: 403 });
    }

    // Increment usage counter if on free tier (not unlimited)
    if (check.limit !== 'unlimited') {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      await db.update(users).set({ jobPostCount: (user?.jobPostCount || 0) + 1 }).where(eq(users.id, userId));
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
