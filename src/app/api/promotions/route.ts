import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, subscriptions, users, adAnalytics } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { parseFormData } from '@/lib/upload';
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

    // Fetch metrics from ad_analytics
    const metrics = await db.select({
      promotionId: adAnalytics.promotionId,
      impressions: sql<number>`sum(impressions)::int`,
      clicks: sql<number>`sum(clicks)::int`,
      spent: sql<number>`sum(spent)::int`,
    }).from(adAnalytics).groupBy(adAnalytics.promotionId);

    const data = promos.map(promo => {
      const metric = metrics.find(m => m.promotionId === promo.id) || { impressions: 0, clicks: 0, spent: 0 };
      const ctr = metric.impressions > 0 ? parseFloat(((metric.clicks / metric.impressions) * 100).toFixed(2)) : 0;
      const cpc = metric.clicks > 0 ? parseFloat((metric.spent / metric.clicks).toFixed(2)) : 0;
      return {
        ...promo,
        impressions: metric.impressions,
        clicks: metric.clicks,
        spent: metric.spent,
        ctr,
        cpc
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/promotions
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const { fields, files } = await parseFormData(req);
    const { 
      subscriptionId, businessName, category, businessDescription, 
      businessContactDetails, foundationDate, purpose 
    } = fields;
    const userId = authPayload.userId;
    let finalStatus = 'draft';

    const bannerFile = files.find(f => f.fieldname === 'banner');
    const bannerUrl = bannerFile ? bannerFile.filepath : (fields.bannerUrl || null);

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
      purpose, bannerUrl, status: finalStatus,
    }).returning();

    return NextResponse.json({
      success: true, message: finalStatus === 'draft' ? 'Draft promotion created' : 'Promotion submitted for approval', data: promotion,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create promotion' }, { status: 500 });
  }
}
