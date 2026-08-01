import { NextRequest, NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

// GET /api/plans — Public endpoint (no auth required)
// Returns all active subscription plans grouped by roleTarget
// Query params: ?role=job_seeker | job_poster | business_promoter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const conditions = [
      eq(subscriptionPlans.isActive, true),
      eq(subscriptionPlans.isDeleted, false),
    ];

    if (role) {
      conditions.push(eq(subscriptionPlans.roleTarget, role));
    }

    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(and(...conditions))
      .orderBy(asc(subscriptionPlans.monthlyPrice));

    // Group by roleTarget
    const grouped: Record<string, typeof plans> = {};
    for (const plan of plans) {
      if (!grouped[plan.roleTarget]) {
        grouped[plan.roleTarget] = [];
      }
      grouped[plan.roleTarget].push(plan);
    }

    return NextResponse.json({ success: true, data: plans, grouped });
  } catch (error: any) {
    console.error('GET /api/plans error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch plans' }, { status: 500 });
  }
}
