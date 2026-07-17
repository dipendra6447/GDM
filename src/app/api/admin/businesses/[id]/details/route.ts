import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromoterProfiles, businessPromotions, invoices, users, adAnalytics } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/businesses/[id]/details - Fetches 360-degree consolidated profile audit details (Super User only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id: businessUserId } = await params;

    // 1. Fetch user account details
    const [userRecord] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, businessUserId))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json({ success: false, message: 'Business user not found' }, { status: 404 });
    }

    // 2. Fetch business promoter profile details
    const [profile] = await db
      .select()
      .from(businessPromoterProfiles)
      .where(eq(businessPromoterProfiles.userId, businessUserId))
      .limit(1);

    // 3. Fetch promotional campaigns with metrics
    const campaignsRaw = await db
      .select()
      .from(businessPromotions)
      .where(eq(businessPromotions.userId, businessUserId))
      .orderBy(desc(businessPromotions.createdAt));

    const promoIds = campaignsRaw.map(c => c.id);
    let campaigns: any[] = [];
    if (promoIds.length > 0) {
      const metrics = await db.select({
        promotionId: adAnalytics.promotionId,
        impressions: sql<number>`sum(impressions)::int`,
        clicks: sql<number>`sum(clicks)::int`,
        spent: sql<number>`sum(spent)::int`,
      }).from(adAnalytics).where(inArray(adAnalytics.promotionId, promoIds)).groupBy(adAnalytics.promotionId);

      campaigns = campaignsRaw.map(camp => {
        const metric = metrics.find(m => m.promotionId === camp.id) || { impressions: 0, clicks: 0, spent: 0 };
        const ctr = metric.impressions > 0 ? parseFloat(((metric.clicks / metric.impressions) * 100).toFixed(2)) : 0;
        const cpc = metric.clicks > 0 ? parseFloat((metric.spent / metric.clicks).toFixed(2)) : 0;
        return {
          ...camp,
          impressions: metric.impressions,
          clicks: metric.clicks,
          spent: metric.spent,
          ctr,
          cpc
        };
      });
    }

    // 4. Fetch invoices list
    const billingInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, businessUserId))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        user: userRecord,
        profile: profile || null,
        campaigns,
        invoices: billingInvoices
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch business details' }, { status: 500 });
  }
}
