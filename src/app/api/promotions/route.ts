import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, subscriptions, users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/promotions (admin — all promotions)
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    const promos = await db.select({
      id: businessPromotions.id, businessName: businessPromotions.businessName,
      bannerUrl: businessPromotions.bannerUrl, status: businessPromotions.status,
      createdAt: businessPromotions.createdAt, userId: businessPromotions.userId, userEmail: users.email,
    }).from(businessPromotions).innerJoin(users, eq(businessPromotions.userId, users.id));
    return NextResponse.json({ success: true, data: promos });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/promotions
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const { subscriptionId, businessName, category, businessDescription, businessContactDetails, foundationDate, purpose, bannerUrl } = await req.json();
    const userId = authPayload.userId;
    let finalStatus = 'draft';

    if (subscriptionId) {
      const [sub] = await db.select().from(subscriptions).where(
        and(eq(subscriptions.id, subscriptionId), eq(subscriptions.userId, userId), eq(subscriptions.subscriptionType, 'business_promoter'), eq(subscriptions.status, 'active'), gt(subscriptions.expiresAt, new Date()))
      ).limit(1);
      if (!sub) return NextResponse.json({ success: false, message: 'Valid active business_promoter subscription required' }, { status: 403 });
      finalStatus = 'pending_approval';
    }

    const [promotion] = await db.insert(businessPromotions).values({
      userId, subscriptionId: subscriptionId || null, businessName, category, businessDescription,
      businessContactDetails, foundationDate: foundationDate ? new Date(foundationDate) : null,
      purpose, bannerUrl: bannerUrl || null, status: finalStatus,
    }).returning();

    return NextResponse.json({
      success: true, message: finalStatus === 'draft' ? 'Draft promotion created' : 'Promotion submitted for approval', data: promotion,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create promotion' }, { status: 500 });
  }
}
