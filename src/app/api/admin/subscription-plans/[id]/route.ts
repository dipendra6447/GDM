import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';

// GET /api/admin/subscription-plans/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [plan] = await db.select().from(subscriptionPlans).where(and(eq(subscriptionPlans.id, id), eq(subscriptionPlans.isDeleted, false))).limit(1);
    if (!plan) return NextResponse.json({ success: false, message: 'Subscription plan not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription plan' }, { status: 500 });
  }
}

// PUT /api/admin/subscription-plans/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    if (!data.name || !data.roleTarget || !data.tier) {
      return NextResponse.json({ success: false, message: 'Name, tier, and role target are required' }, { status: 400 });
    }

    const [updated] = await db.update(subscriptionPlans).set({
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
      isActive: data.isActive !== undefined ? data.isActive : true,
      updatedAt: new Date()
    }).where(eq(subscriptionPlans.id, id)).returning();
    
    if (!updated) return NextResponse.json({ success: false, message: 'Subscription plan not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Subscription plan updated', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update subscription plan' }, { status: 500 });
  }
}

// DELETE /api/admin/subscription-plans/[id] (Soft Delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .update(subscriptionPlans)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(eq(subscriptionPlans.id, id), eq(subscriptionPlans.isDeleted, false)))
      .returning();
      
    if (!deleted) return NextResponse.json({ success: false, message: 'Subscription plan not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Subscription plan deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete subscription plan' }, { status: 500 });
  }
}
