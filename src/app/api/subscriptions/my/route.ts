import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, subscriptionPlans } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/subscriptions/my — Returns user's subscriptions with plan details
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const subs = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        planId: subscriptions.planId,
        subscriptionType: subscriptions.subscriptionType,
        tier: subscriptions.tier,
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status,
        expiresAt: subscriptions.expiresAt,
        createdAt: subscriptions.createdAt,
        // Plan details
        planName: subscriptionPlans.name,
        planTier: subscriptionPlans.tier,
        planFeatures: subscriptionPlans.features,
        planLimits: subscriptionPlans.limits,
        planDailyPrice: subscriptionPlans.dailyPrice,
        planWeeklyPrice: subscriptionPlans.weeklyPrice,
        planMonthlyPrice: subscriptionPlans.monthlyPrice,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, authPayload.userId));

    return NextResponse.json({ success: true, data: subs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
