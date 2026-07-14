import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/promotions/my
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const promos = await db.select().from(businessPromotions).where(eq(businessPromotions.userId, authPayload.userId));
    return NextResponse.json({ success: true, data: promos });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch promotions' }, { status: 500 });
  }
}
