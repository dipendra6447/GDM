import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/subscriptions/my
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.userId, authPayload.userId));
    return NextResponse.json({ success: true, data: subs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
