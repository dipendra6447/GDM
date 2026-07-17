import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { savedJobs } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/jobs/saved/[id] — Check if a specific job is saved by the user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await requireAuth(req);
    if (!authPayload.roles.includes(1)) {
      return NextResponse.json({ success: true, saved: false });
    }
    const userId = authPayload.userId;

    const [saved] = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)))
      .limit(1);

    return NextResponse.json({ success: true, saved: !!saved });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized', saved: false }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to check saved status', saved: false }, { status: 500 });
  }
}

// DELETE /api/jobs/saved/[id] — Remove a job from wishlist
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const authPayload = await requireAuth(req);
    if (!authPayload.roles.includes(1)) {
      return NextResponse.json({ success: false, message: 'Employers are not allowed to save/unsave jobs.' }, { status: 403 });
    }
    const userId = authPayload.userId;

    await db
      .delete(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));

    return NextResponse.json({ success: true, message: 'Job removed from wishlist' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ DELETE saved job error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to remove saved job' }, { status: 500 });
  }
}
