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
      id: businessPromotions.id,
      businessName: businessPromotions.businessName,
      category: businessPromotions.category,
      purpose: businessPromotions.purpose,
      offerTag: businessPromotions.offerTag,
      ctaLabel: businessPromotions.ctaLabel,
      businessDescription: businessPromotions.businessDescription,
      businessContactDetails: businessPromotions.businessContactDetails,
      bannerUrl: businessPromotions.bannerUrl,
      status: businessPromotions.status,
      createdAt: businessPromotions.createdAt,
      userId: businessPromotions.userId,
      userEmail: users.email,
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
    console.error('GET /api/promotions error:', error);
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/promotions
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);

    let fields: Record<string, string> = {};
    let files: any[] = [];

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseFormData(req);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      // Fallback: if sent as JSON (e.g. from admin or test tools)
      try {
        const body = await req.json();
        fields = body;
      } catch {
        return NextResponse.json(
          { success: false, message: 'Request must be multipart/form-data or JSON' },
          { status: 400 }
        );
      }
    }

    const { 
      subscriptionId, businessName, category, businessDescription, 
      businessContactDetails, foundationDate, purpose, offerTag, ctaLabel, userEmail 
    } = fields;

    let targetUserId = authPayload.userId;

    // If Admin creates promotion for a specific user email
    if (userEmail && userEmail.trim() !== '' && hasRole(authPayload, ROLES.SUPER_USER)) {
      const [foundUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail.trim()))
        .limit(1);

      if (foundUser) {
        targetUserId = foundUser.id;
      }
    }

    let finalStatus = 'draft';

    // Parse files or string URL fields
    const bannerFile1 = files.find(f => f.fieldname === 'banner' || f.fieldname === 'banner1');
    const bannerFile2 = files.find(f => f.fieldname === 'banner2');
    const bannerFile3 = files.find(f => f.fieldname === 'banner3');

    const rawBanner1 = bannerFile1 ? bannerFile1.filepath : (fields.bannerUrl || fields.bannerUrl1 || null);
    const rawBanner2 = bannerFile2 ? bannerFile2.filepath : (fields.bannerUrl2 || null);
    const rawBanner3 = bannerFile3 ? bannerFile3.filepath : (fields.bannerUrl3 || null);

    const posArray = fields.bannerPositions ? fields.bannerPositions.split(',').map(s => s.trim()) : [];
    const attachPos = (url: string | null, idx: number) => {
      if (!url) return null;
      const cleanUrl = url.split('#pos=')[0];
      const pos = posArray[idx] || '50% 50%';
      return `${cleanUrl}#pos=${encodeURIComponent(pos)}`;
    };

    const banner1 = attachPos(rawBanner1, 0);
    const banner2 = attachPos(rawBanner2, 1);
    const banner3 = attachPos(rawBanner3, 2);

    const bannerUrls = [banner1, banner2, banner3].filter(Boolean);
    const bannerUrl = bannerUrls.length > 0 ? bannerUrls.join(',') : null;

    // Validate & sanitize subscriptionId UUID
    const cleanSubId = (subscriptionId && subscriptionId !== 'null' && subscriptionId !== 'undefined' && subscriptionId.trim() !== '')
      ? subscriptionId.trim()
      : null;

    if (cleanSubId) {
      const [sub] = await db.select().from(subscriptions).where(
        and(
          eq(subscriptions.id, cleanSubId),
          eq(subscriptions.userId, targetUserId),
          eq(subscriptions.subscriptionType, 'business_promoter'),
          eq(subscriptions.status, 'active'),
          gt(subscriptions.expiresAt, new Date())
        )
      ).limit(1);

      if (sub) {
        finalStatus = 'pending_approval';
      }
    }

    // Safely parse foundation date
    let parsedFoundationDate: Date | null = null;
    if (foundationDate && foundationDate.trim() !== '' && !isNaN(Date.parse(foundationDate))) {
      parsedFoundationDate = new Date(foundationDate);
    }

    const [promotion] = await db.insert(businessPromotions).values({
      userId: targetUserId,
      subscriptionId: cleanSubId,
      businessName: businessName || 'Promotional Campaign',
      category: category || 'IT SERVICES',
      businessDescription: businessDescription || null,
      businessContactDetails: businessContactDetails || null,
      foundationDate: parsedFoundationDate,
      purpose: purpose || 'Transform Your Business With Technology',
      bannerUrl,
      offerTag: offerTag || '🔥 Free Consultation — Limited Slots',
      ctaLabel: ctaLabel || 'View Business',
      status: finalStatus,
    }).returning();

    return NextResponse.json({
      success: true,
      message: finalStatus === 'draft' ? 'Draft promotion created' : 'Promotion submitted for approval',
      data: promotion,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/promotions error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create promotion',
    }, { status: 500 });
  }
}
