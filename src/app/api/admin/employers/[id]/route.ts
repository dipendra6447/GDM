import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, employerProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PUT /api/admin/employers/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    const { id: userId } = await params;
    const { companyName, industry, companySize, hrName } = await req.json();

    const [updated] = await db.update(employerProfiles).set({ companyName, industry, companySize, hrName, updatedAt: new Date() }).where(eq(employerProfiles.userId, userId)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Employer not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Employer updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update employer' }, { status: 500 });
  }
}

// DELETE /api/admin/employers/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });

    const { id: userId } = await params;
    const [updated] = await db.update(users).set({ isDeleted: true, isActive: false }).where(eq(users.id, userId)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Employer soft-deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to delete employer' }, { status: 500 });
  }
}
