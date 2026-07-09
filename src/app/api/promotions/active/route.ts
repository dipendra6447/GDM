import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions } from '@/db/schema';

// GET /api/promotions/active (public)
export async function GET() {
  const promos = await db.select({
    id: businessPromotions.id, businessName: businessPromotions.businessName,
    bannerUrl: businessPromotions.bannerUrl, createdAt: businessPromotions.createdAt,
  }).from(businessPromotions).where(eq(businessPromotions.status, 'active'));
  return NextResponse.json({ success: true, data: promos });
}
