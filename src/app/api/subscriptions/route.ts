import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, subscriptionPlans, users, invoices, jobSeekerProfiles, employerProfiles, businessPromoterProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { sendSubscriptionReceiptEmail } from '@/lib/resend';

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
        billingCycle: subscriptions.billingCycle,
        status: subscriptions.status, expiresAt: subscriptions.expiresAt, createdAt: subscriptions.createdAt,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id));
    return NextResponse.json({ success: true, data: subs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const body = await req.json() as {
      planId?: string;
      subscriptionType?: string;
      billingCycle?: 'daily' | 'weekly' | 'monthly';
      tier?: string;
      amount?: number;
    };
    const userId = authPayload.userId;
    let { planId, subscriptionType, billingCycle, tier, amount } = body;

    // ─── Resolve plan details ─────────────────────────────────────────
    let resolvedPlan: any = null;

    if (planId) {
      // New flow: look up plan from DB
      const [plan] = await db.select().from(subscriptionPlans)
        .where(and(eq(subscriptionPlans.id, planId), eq(subscriptionPlans.isActive, true), eq(subscriptionPlans.isDeleted, false)))
        .limit(1);

      if (!plan) {
        return NextResponse.json({ success: false, message: 'Subscription plan not found or inactive' }, { status: 404 });
      }

      resolvedPlan = plan;
      subscriptionType = plan.roleTarget;
      tier = plan.tier;

      // Determine price based on billing cycle
      billingCycle = billingCycle || 'monthly';
      if (amount === undefined) {
        if (billingCycle === 'daily') amount = plan.dailyPrice;
        else if (billingCycle === 'weekly') amount = plan.weeklyPrice;
        else amount = plan.monthlyPrice;
      }
    } else if (subscriptionType && tier) {
      // Legacy flow: find plan by roleTarget + tier
      const [plan] = await db.select().from(subscriptionPlans)
        .where(and(
          eq(subscriptionPlans.roleTarget, subscriptionType),
          eq(subscriptionPlans.tier, tier),
          eq(subscriptionPlans.isActive, true),
          eq(subscriptionPlans.isDeleted, false)
        ))
        .limit(1);

      if (plan) {
        resolvedPlan = plan;
        planId = plan.id;
        billingCycle = billingCycle || 'monthly';
        if (amount === undefined) {
          if (billingCycle === 'daily') amount = plan.dailyPrice;
          else if (billingCycle === 'weekly') amount = plan.weeklyPrice;
          else amount = plan.monthlyPrice;
        }
      } else {
        billingCycle = billingCycle || 'monthly';
      }
    } else {
      return NextResponse.json({ success: false, message: 'planId or subscriptionType + tier required' }, { status: 400 });
    }

    if (!subscriptionType || !tier) {
      return NextResponse.json({ success: false, message: 'Could not resolve subscription type and tier' }, { status: 400 });
    }

    // ─── Check for existing active subscription ───────────────────────
    const existing = await db.select().from(subscriptions).where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.subscriptionType, subscriptionType), eq(subscriptions.status, 'active'), gt(subscriptions.expiresAt, new Date()))
    ).limit(1);

    let sub: any = null;

    if (existing.length > 0) {
      // Extend existing subscription
      const currentSub = existing[0];
      const newExpiresAt = new Date(Math.max(new Date(currentSub.expiresAt).getTime(), Date.now()));
      if (billingCycle === 'daily') newExpiresAt.setDate(newExpiresAt.getDate() + 1);
      else if (billingCycle === 'weekly') newExpiresAt.setDate(newExpiresAt.getDate() + 7);
      else newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

      const [updatedSub] = await db.update(subscriptions)
        .set({
          tier,
          billingCycle: billingCycle || 'monthly',
          planId: planId || currentSub.planId,
          expiresAt: newExpiresAt,
          status: 'active',
        })
        .where(eq(subscriptions.id, currentSub.id))
        .returning();

      sub = updatedSub;
    } else {
      // Create new subscription
      const expiresAt = new Date();
      if (billingCycle === 'daily') expiresAt.setDate(expiresAt.getDate() + 1);
      else if (billingCycle === 'weekly') expiresAt.setDate(expiresAt.getDate() + 7);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      const [newSub] = await db.insert(subscriptions).values({
        userId,
        planId: planId || undefined,
        subscriptionType,
        tier,
        billingCycle: billingCycle || 'monthly',
        status: 'active',
        expiresAt,
      }).returning();
      sub = newSub;
    }

    // ─── Fetch user and profile details for invoice ───────────────────
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userEmail = userRecord?.email || '';

    let billingName = userEmail;
    let billingAddress = '';
    let gstNumber = null;

    if (subscriptionType === 'job_seeker') {
      const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
      if (profile) {
        billingName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || userEmail;
        if (profile.address) {
          const addr = profile.address as any;
          billingAddress = [addr.addressLine1, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ');
        }
      }
    } else if (subscriptionType === 'job_poster') {
      const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1);
      if (profile) {
        billingName = profile.companyName || userEmail;
        billingAddress = profile.headquarters || '';
      }
    } else if (subscriptionType === 'business_promoter') {
      const [profile] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, userId)).limit(1);
      if (profile) {
        billingName = profile.businessName || userEmail;
        billingAddress = profile.address || '';
        gstNumber = profile.gstNumber || null;
      }
    }

    // ─── Create corresponding Invoice ─────────────────────────────────
    const basePrice = amount !== undefined ? amount : 0;
    const taxAmount = Math.round(basePrice * 0.18); // 18% GST
    const totalAmount = basePrice + taxAmount;

    const [invoiceCountObj] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices);
    const invoiceCount = invoiceCountObj?.count || 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    const [inv] = await db.insert(invoices).values({
      userId,
      subscriptionId: sub.id,
      invoiceNumber,
      amount: basePrice,
      tax: taxAmount,
      totalAmount,
      billingName,
      billingEmail: userEmail,
      billingAddress,
      gstNumber,
      paymentMethod: 'card',
      paymentStatus: 'paid'
    }).returning();

    // Trigger subscription receipt email asynchronously (non-blocking)
    const planTitle = resolvedPlan?.name || `${subscriptionType.replace('_', ' ')} Plan`;
    sendSubscriptionReceiptEmail({
      toEmail: userEmail,
      billingName,
      planName: planTitle,
      tier,
      amount: totalAmount,
      billingCycle: billingCycle || 'monthly',
      invoiceNumber,
      expiresAt: sub.expiresAt,
    }).catch(err => console.error('Background subscription receipt email error:', err));

    return NextResponse.json({
      success: true,
      message: 'Subscription purchased and invoice generated',
      data: sub,
      invoice: inv
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/subscriptions error:', error);
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create subscription' }, { status: 500 });
  }
}
