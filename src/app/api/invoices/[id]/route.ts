import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/invoices/[id] - Fetch detailed invoice details by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    const { id: invoiceId } = await params;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    // Authorization: Owner or Admin
    const isAdmin = hasRole(authPayload, ROLES.SUPER_USER);
    const isOwner = invoice.userId === authPayload.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch invoice' }, { status: 500 });
  }
}
