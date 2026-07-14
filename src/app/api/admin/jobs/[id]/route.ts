import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/jobs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    
    if (!job) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch job' }, { status: 500 });
  }
}

// PUT /api/admin/jobs/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description, companyName, location, category, employerId } = await req.json();

    const [existingJob] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!existingJob) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });

    const updateData: any = { title, description, companyName, location, category, employerId };

    if (!existingJob.slug && title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      const uniqueSuffix = Math.random().toString(36).substring(2, 6);
      updateData.slug = `${baseSlug}-${uniqueSuffix}`;
    }

    const [updated] = await db.update(jobs).set(updateData).where(eq(jobs.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Job updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE /api/admin/jobs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;

    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!job) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });

    await db.update(jobs).set({ isDeleted: true }).where(eq(jobs.id, id));
    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete job' }, { status: 500 });
  }
}
