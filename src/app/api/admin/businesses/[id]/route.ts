import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, businessPromoterProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PUT /api/admin/businesses/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    const { id: userId } = await params;
    const { businessName, businessCategory, gstNumber, contactPhone } = await req.json();

    const [updated] = await db.update(businessPromoterProfiles).set({ businessName, businessCategory, gstNumber, contactPhone, updatedAt: new Date() }).where(eq(businessPromoterProfiles.userId, userId)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Business not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Business updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update business' }, { status: 500 });
  }
}

// DELETE /api/admin/businesses/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });

    const { id: userId } = await params;
    const [updated] = await db.update(users).set({ isDeleted: true, isActive: false }).where(eq(users.id, userId)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Business soft-deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete business' }, { status: 500 });
  }
}
