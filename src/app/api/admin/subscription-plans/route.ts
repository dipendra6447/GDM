import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

// GET /api/admin/subscription-plans
export async function GET() {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}

// POST /api/admin/subscription-plans
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.price || !data.roleTarget) {
      return NextResponse.json({ success: false, message: 'Name, price, and role target are required' }, { status: 400 });
    }

    const [newPlan] = await db.insert(subscriptionPlans).values({
      name: data.name,
      price: parseInt(data.price, 10),
      billingCycle: data.billingCycle || '/month',
      roleTarget: data.roleTarget,
      features: data.features || [],
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
