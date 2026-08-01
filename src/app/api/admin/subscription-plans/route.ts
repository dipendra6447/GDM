import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

// GET /api/admin/subscription-plans
export async function GET() {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isDeleted, false)).orderBy(desc(subscriptionPlans.createdAt));
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}

// POST /api/admin/subscription-plans
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.roleTarget || !data.tier) {
      return NextResponse.json({ success: false, message: 'Name, tier, and role target are required' }, { status: 400 });
    }

    const [newPlan] = await db.insert(subscriptionPlans).values({
      name: data.name,
      tier: data.tier,
      roleTarget: data.roleTarget,
      dailyPrice: parseInt(data.dailyPrice || '0', 10),
      weeklyPrice: parseInt(data.weeklyPrice || '0', 10),
      monthlyPrice: parseInt(data.monthlyPrice || '0', 10),
      features: data.features || [],
      limits: data.limits || {},
      imageUrl: data.imageUrl || null,
      isPopular: !!data.isPopular,
      isBestValue: !!data.isBestValue,
      isActive: data.isActive !== undefined ? data.isActive : true
    }).returning();
    
    return NextResponse.json({ success: true, message: 'Subscription plan created', data: newPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create subscription plan' }, { status: 500 });
  }
}
