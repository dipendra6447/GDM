import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { invoices, users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/invoices - Fetch all invoices across the system (Super User only)
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const allInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        tax: invoices.tax,
        totalAmount: invoices.totalAmount,
        billingName: invoices.billingName,
        billingEmail: invoices.billingEmail,
        gstNumber: invoices.gstNumber,
        paymentMethod: invoices.paymentMethod,
        paymentStatus: invoices.paymentStatus,
        createdAt: invoices.createdAt,
        userEmail: users.email
      })
      .from(invoices)
      .innerJoin(users, eq(invoices.userId, users.id))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ success: true, data: allInvoices });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch invoices' }, { status: 500 });
  }
}
