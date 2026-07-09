import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PATCH /api/subscriptions/[id]/expire (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    const { id } = await params;
    const [updated] = await db.update(subscriptions).set({ status: 'expired' }).where(eq(subscriptions.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Subscription expired', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to expire subscription' }, { status: 500 });
  }
}
