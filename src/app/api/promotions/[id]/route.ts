import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, adAnalytics } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { parseFormData } from '@/lib/upload';
import { ROLES } from '@/lib/constants';

// PUT /api/promotions/[id] - Updates an existing campaign (Owner or Admin)
export async function PUT(
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
      return NextResponse.json({ success: false, message: 'Access denied: You cannot edit this campaign' }, { status: 403 });
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
      businessName, category, businessDescription, 
      businessContactDetails, foundationDate, purpose, offerTag, ctaLabel 
    } = fields;

    // Parse files or fallback to existing banner URL
    const bannerFile1 = files.find(f => f.fieldname === 'banner' || f.fieldname === 'banner1');
    const bannerFile2 = files.find(f => f.fieldname === 'banner2');
    const bannerFile3 = files.find(f => f.fieldname === 'banner3');

    const banner1 = bannerFile1 ? bannerFile1.filepath : (fields.bannerUrl || fields.bannerUrl1 || null);
    const banner2 = bannerFile2 ? bannerFile2.filepath : (fields.bannerUrl2 || null);
    const banner3 = bannerFile3 ? bannerFile3.filepath : (fields.bannerUrl3 || null);

    let bannerUrl = promo.bannerUrl;
    const newBannerUrls = [banner1, banner2, banner3].filter(Boolean);
    if (newBannerUrls.length > 0) {
      bannerUrl = newBannerUrls.join(',');
    }

    // Safely parse foundation date
    let parsedFoundationDate: Date | null = promo.foundationDate;
    if (foundationDate && foundationDate.trim() !== '' && !isNaN(Date.parse(foundationDate))) {
      parsedFoundationDate = new Date(foundationDate);
    }

    const updatePayload: any = {};
    if (businessName !== undefined) updatePayload.businessName = businessName;
    if (category !== undefined) updatePayload.category = category;
    if (businessDescription !== undefined) updatePayload.businessDescription = businessDescription;
    if (businessContactDetails !== undefined) updatePayload.businessContactDetails = businessContactDetails;
    if (parsedFoundationDate !== undefined) updatePayload.foundationDate = parsedFoundationDate;
    if (purpose !== undefined) updatePayload.purpose = purpose;
    if (bannerUrl !== undefined) updatePayload.bannerUrl = bannerUrl;
    if (offerTag !== undefined) updatePayload.offerTag = offerTag;
    if (ctaLabel !== undefined) updatePayload.ctaLabel = ctaLabel;
    if (fields.status !== undefined && isAdmin) updatePayload.status = fields.status;

    const [updatedPromo] = await db
      .update(businessPromotions)
      .set(updatePayload)
      .where(eq(businessPromotions.id, promoId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      data: updatedPromo,
    });
  } catch (error: any) {
    console.error('PUT /api/promotions/[id] error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: error.message || 'Failed to update campaign' }, { status: 500 });
  }
}

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
