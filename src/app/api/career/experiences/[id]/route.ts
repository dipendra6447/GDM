import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { workExperiences } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// PATCH /api/career/experiences/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;
    const data = await req.json();

    const [row] = await db.select().from(workExperiences).where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    const [updated] = await db.update(workExperiences).set({ ...data, updatedAt: new Date() }).where(eq(workExperiences.id, id)).returning();
    return NextResponse.json({ success: true, message: 'Work experience updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update experience' }, { status: 500 });
  }
}

// DELETE /api/career/experiences/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;

    const [row] = await db.select().from(workExperiences).where(and(eq(workExperiences.id, id), eq(workExperiences.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    await db.delete(workExperiences).where(eq(workExperiences.id, id));
    return NextResponse.json({ success: true, message: 'Work experience deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete experience' }, { status: 500 });
  }
}
