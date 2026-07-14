import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { educations } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// PATCH /api/career/educations/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;
    const data = await req.json();

    const [row] = await db.select().from(educations).where(and(eq(educations.id, id), eq(educations.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    const [updated] = await db.update(educations).set({ ...data, updatedAt: new Date() }).where(eq(educations.id, id)).returning();
    return NextResponse.json({ success: true, message: 'Education updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update education' }, { status: 500 });
  }
}

// DELETE /api/career/educations/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;

    const [row] = await db.select().from(educations).where(and(eq(educations.id, id), eq(educations.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    await db.delete(educations).where(eq(educations.id, id));
    return NextResponse.json({ success: true, message: 'Education deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete education' }, { status: 500 });
  }
}
