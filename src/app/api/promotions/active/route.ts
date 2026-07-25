import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions } from '@/db/schema';

// GET /api/promotions/active (public — active campaigns)
export async function GET() {
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
    createdAt: businessPromotions.createdAt,
  }).from(businessPromotions).where(eq(businessPromotions.status, 'active'));

  return NextResponse.json({ success: true, data: promos });
}
