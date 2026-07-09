import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobs, users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/jobs
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const allJobs = await db
      .select({
        id: jobs.id, title: jobs.title, description: jobs.description, companyName: jobs.companyName,
        location: jobs.location, salaryRange: jobs.salaryRange, jobType: jobs.jobType,
        workMode: jobs.workMode, experience: jobs.experience, skills: jobs.skills, category: jobs.category,
        isActive: jobs.isActive, isDeleted: jobs.isDeleted, createdAt: jobs.createdAt,
        employerId: jobs.employerId, employerEmail: users.email,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.employerId, users.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ success: true, data: allJobs, meta: { page, limit } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST /api/admin/jobs
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { title, description, companyName, location, category, employerId } = await req.json();
    if (!title || !description || !employerId) {
      return NextResponse.json({ success: false, message: 'Title, description, and employerId required' }, { status: 400 });
    }

    const [newJob] = await db.insert(jobs).values({ title, description, companyName, location, category, employerId }).returning();
    return NextResponse.json({ success: true, message: 'Job added', data: newJob }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to add job' }, { status: 500 });
  }
}
