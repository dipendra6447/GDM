import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PATCH /api/admin/jobs/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const { isActive } = await req.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'isActive must be a boolean' }, { status: 400 });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!job) return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });

    await db.update(jobs).set({ isActive }).where(eq(jobs.id, id));
    return NextResponse.json({ success: true, message: `Job ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update job status' }, { status: 500 });
  }
}
