import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { certifications } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// PATCH /api/career/certifications/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;
    const data = await req.json();

    const [row] = await db.select().from(certifications).where(and(eq(certifications.id, id), eq(certifications.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    const [updated] = await db.update(certifications).set({ ...data, updatedAt: new Date() }).where(eq(certifications.id, id)).returning();
    return NextResponse.json({ success: true, message: 'Certification updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update certification' }, { status: 500 });
  }
}

// DELETE /api/career/certifications/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { id } = await params;

    const [row] = await db.select().from(certifications).where(and(eq(certifications.id, id), eq(certifications.userId, userId))).limit(1);
    if (!row) return NextResponse.json({ success: false, message: 'Record not found or not yours' }, { status: 404 });

    await db.delete(certifications).where(eq(certifications.id, id));
    return NextResponse.json({ success: true, message: 'Certification deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete certification' }, { status: 500 });
  }
}
