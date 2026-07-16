import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, users, invoices, jobSeekerProfiles, employerProfiles, businessPromoterProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

const PRICING: Record<string, Record<string, number>> = {
  job_seeker: {
    daily: 29,
    weekly: 99,
    monthly: 299,
  },
  job_poster: {
    daily: 49,
    weekly: 199,
    monthly: 599,
  },
  business_promoter: {
    daily: 99,
    weekly: 499,
    monthly: 1499,
  }
};

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

export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const body = await req.json() as { 
      subscriptionType: string; 
      tier: 'daily' | 'weekly' | 'monthly'; 
      amount?: number;
    };
    const { subscriptionType, tier, amount } = body;
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

    // Fetch user and profile details for invoice
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

    // Insert Subscription
    const [sub] = await db.insert(subscriptions).values({ userId, subscriptionType, tier, status: 'active', expiresAt }).returning();

    // Create corresponding Invoice
    const basePrice = amount !== undefined ? amount : (PRICING[subscriptionType]?.[tier] || 0);
    const taxAmount = Math.round(basePrice * 0.18); // 18% GST
    const totalAmount = basePrice + taxAmount;

    const [invoiceCountObj] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices);
    const invoiceCount = invoiceCountObj?.count || 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    await db.insert(invoices).values({
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
    });

    return NextResponse.json({ success: true, message: 'Subscription purchased and invoice generated', data: sub }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create subscription' }, { status: 500 });
  }
}
