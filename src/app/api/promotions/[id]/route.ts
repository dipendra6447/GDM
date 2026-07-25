import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, adAnalytics } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// DELETE /api/promotions/[id] - Deletes a campaign (Owner or Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    const { id: promoId } = await params;

    // Check if promotion exists
    const [promo] = await db
      .select()
      .from(businessPromotions)
      .where(eq(businessPromotions.id, promoId))
      .limit(1);

    if (!promo) {
      return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });
    }

    const isOwner = promo.userId === authPayload.userId;
    const isAdmin = hasRole(authPayload, ROLES.SUPER_USER);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Access denied: You cannot delete this campaign' }, { status: 403 });
    }

    // Delete associated analytics records first
    await db.delete(adAnalytics).where(eq(adAnalytics.promotionId, promoId));

    // Delete the promotion record
    await db.delete(businessPromotions).where(eq(businessPromotions.id, promoId));

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to delete campaign' }, { status: 500 });
  }
}
