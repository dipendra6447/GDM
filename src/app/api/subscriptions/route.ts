import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/subscriptions (admin — all subscriptions)
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    const subs = await db
      .select({
        id: subscriptions.id, userId: subscriptions.userId, userEmail: users.email,
        subscriptionType: subscriptions.subscriptionType, tier: subscriptions.tier,
        status: subscriptions.status, expiresAt: subscriptions.expiresAt, createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id));
    return NextResponse.json({ success: true, data: subs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST /api/subscriptions
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const { subscriptionType, tier } = await req.json() as { subscriptionType: string; tier: 'daily' | 'weekly' | 'monthly' };
    const userId = authPayload.userId;

    const existing = await db.select().from(subscriptions).where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.subscriptionType, subscriptionType), eq(subscriptions.status, 'active'), gt(subscriptions.expiresAt, new Date()))
    ).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: `An active ${subscriptionType} subscription already exists`, data: existing[0] }, { status: 409 });
    }

    const expiresAt = new Date();
    if (tier === 'daily') expiresAt.setDate(expiresAt.getDate() + 1);
    else if (tier === 'weekly') expiresAt.setDate(expiresAt.getDate() + 7);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);

    const [sub] = await db.insert(subscriptions).values({ userId, subscriptionType, tier, status: 'active', expiresAt }).returning();
    return NextResponse.json({ success: true, message: 'Subscription created', data: sub }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create subscription' }, { status: 500 });
  }
}
