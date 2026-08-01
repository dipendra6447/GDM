import { NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions } from '@/db/schema';

// GET /api/promotions/active (public — active & approved campaigns)
export async function GET() {
  try {
    const promos = await db
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
        createdAt: businessPromotions.createdAt,
      })
      .from(businessPromotions)
      .where(
        or(
          eq(businessPromotions.status, 'active'),
          eq(businessPromotions.status, 'approved')
        )
      );

    return NextResponse.json({ success: true, data: promos });
  } catch (error: any) {
    console.error('Error fetching active promotions:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
