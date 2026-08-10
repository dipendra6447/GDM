import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, businessPromoterProfiles, users, adAnalytics } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { parseFormData } from '@/lib/upload';

// GET /api/admin/promotions (Super user — fetch all promotions and registered business promoters)
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    // 1. Fetch existing business promotions with owner email and promoter profile details
    const existingPromos = await db
      .select({
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
        contactPhone: businessPromoterProfiles.contactPhone,
        gstNumber: businessPromoterProfiles.gstNumber,
      })
      .from(businessPromotions)
      .innerJoin(users, eq(businessPromotions.userId, users.id))
      .leftJoin(businessPromoterProfiles, eq(businessPromotions.userId, businessPromoterProfiles.userId));

    // 2. Fetch registered business promoter profiles to include any registered business owner without an active campaign
    const promoterUsers = await db
      .select({
        userId: users.id,
        userEmail: users.email,
        businessName: businessPromoterProfiles.businessName,
        businessCategory: businessPromoterProfiles.businessCategory,
        about: businessPromoterProfiles.about,
        logoUrl: businessPromoterProfiles.logoUrl,
        contactPhone: businessPromoterProfiles.contactPhone,
        gstNumber: businessPromoterProfiles.gstNumber,
        createdAt: users.createdAt,
      })
      .from(businessPromoterProfiles)
      .innerJoin(users, eq(businessPromoterProfiles.userId, users.id));

    // Include registered business promoters who don't have a businessPromotions record yet
    const existingUserIds = new Set(existingPromos.map((p) => p.userId));
    const unpromotedPromoters = promoterUsers
      .filter((bp) => !existingUserIds.has(bp.userId))
      .map((bp) => ({
        id: `draft_${bp.userId}`,
        businessName: bp.businessName || 'Registered Business',
        category: bp.businessCategory || 'GENERAL',
        purpose: bp.about || 'Registered Business Promoter',
        offerTag: '🔥 Special Offer',
        ctaLabel: 'Visit Business',
        businessDescription: bp.about || '',
        businessContactDetails: '',
        bannerUrl: bp.logoUrl || null,
        status: 'draft',
        createdAt: bp.createdAt,
        userId: bp.userId,
        userEmail: bp.userEmail,
        contactPhone: bp.contactPhone,
        gstNumber: bp.gstNumber || 'N/A',
        isDraftPlaceholder: true,
      }));

    const allListings = [...existingPromos, ...unpromotedPromoters];

    // 3. Fetch performance metrics from ad_analytics
    const metrics = await db
      .select({
        promotionId: adAnalytics.promotionId,
        impressions: sql<number>`sum(impressions)::int`,
        clicks: sql<number>`sum(clicks)::int`,
        spent: sql<number>`sum(spent)::int`,
      })
      .from(adAnalytics)
      .groupBy(adAnalytics.promotionId);

    const data = allListings.map((promo) => {
      const metric = metrics.find((m) => m.promotionId === promo.id) || { impressions: 0, clicks: 0, spent: 0 };
      const ctr = metric.impressions > 0 ? parseFloat(((metric.clicks / metric.impressions) * 100).toFixed(2)) : 0;
      const cpc = metric.clicks > 0 ? parseFloat((metric.spent / metric.clicks).toFixed(2)) : 0;
      return {
        ...promo,
        impressions: metric.impressions,
        clicks: metric.clicks,
        spent: metric.spent,
        ctr,
        cpc,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('GET /api/admin/promotions error:', error);
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST /api/admin/promotions
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    let fields: Record<string, string> = {};
    let files: any[] = [];

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseFormData(req);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      try {
        fields = await req.json();
      } catch {
        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
      }
    }

    const {
      businessName, category, businessDescription,
      businessContactDetails, purpose, offerTag, ctaLabel, userEmail, status
    } = fields;

    let targetUserId = authPayload.userId;

    if (userEmail && userEmail.trim() !== '') {
      const [foundUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail.trim()))
        .limit(1);

      if (foundUser) {
        targetUserId = foundUser.id;
      }
    }

    // Parse files or string URL fields
    const bannerFile1 = files.find(f => f.fieldname === 'banner' || f.fieldname === 'banner1');
    const bannerFile2 = files.find(f => f.fieldname === 'banner2');
    const bannerFile3 = files.find(f => f.fieldname === 'banner3');

    const banner1 = bannerFile1 ? bannerFile1.filepath : (fields.bannerUrl || fields.bannerUrl1 || null);
    const banner2 = bannerFile2 ? bannerFile2.filepath : (fields.bannerUrl2 || null);
    const banner3 = bannerFile3 ? bannerFile3.filepath : (fields.bannerUrl3 || null);

    const bannerUrls = [banner1, banner2, banner3].filter(Boolean);
    const bannerUrl = bannerUrls.length > 0 ? bannerUrls.join(',') : null;

    const [promotion] = await db.insert(businessPromotions).values({
      userId: targetUserId,
      businessName: businessName || 'Promotional Campaign',
      category: category || 'IT SERVICES',
      businessDescription: businessDescription || null,
      businessContactDetails: businessContactDetails || null,
      purpose: purpose || 'Transform Your Business With Technology',
      bannerUrl,
      offerTag: offerTag || '🔥 Free Consultation — Limited Slots',
      ctaLabel: ctaLabel || 'Visit Website',
      status: status || 'active',
    }).returning();

    // Sync to businessPromoterProfiles
    const [existingProfile] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, targetUserId)).limit(1);
    if (existingProfile) {
      await db.update(businessPromoterProfiles).set({
        businessName: businessName || existingProfile.businessName,
        businessCategory: category || existingProfile.businessCategory,
        about: businessDescription || existingProfile.about,
      }).where(eq(businessPromoterProfiles.userId, targetUserId));
    } else {
      await db.insert(businessPromoterProfiles).values({
        userId: targetUserId,
        businessName: businessName || 'Business Promoter',
        businessCategory: category || 'IT SERVICES',
        about: businessDescription || null,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Business promotion created successfully',
      data: promotion,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/promotions error:', error);
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: error.message || 'Failed to create promotion' }, { status: 500 });
  }
}
