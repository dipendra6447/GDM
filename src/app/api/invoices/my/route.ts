import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/invoices/my - Get invoice history for the current logged-in user
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, authPayload.userId))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ success: true, data: userInvoices });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch billing history' }, { status: 500 });
  }
}
