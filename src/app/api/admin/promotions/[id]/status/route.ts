import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PATCH /api/admin/promotions/[id]/status (Super User only — approve, reject, expire campaign)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id: promoId } = await params;
    const { status } = await req.json();

    if (!['draft', 'pending_approval', 'active', 'rejected', 'expired'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }

    const [updated] = await db
      .update(businessPromotions)
      .set({ status })
      .where(eq(businessPromotions.id, promoId))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Promotion campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Campaign marked as ${status.replace('_', ' ')}`,
      data: updated,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update promotion status' }, { status: 500 });
  }
}
