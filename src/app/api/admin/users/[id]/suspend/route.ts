import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { eq } from 'drizzle-orm';

// PATCH /api/admin/users/[id]/suspend - Toggle account suspension status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json().catch(() => ({}));

    // Find the target user
    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Determine target isActive state (if explicitly passed as boolean or toggle)
    const newIsActive = typeof body.isActive === 'boolean' ? body.isActive : !targetUser.isActive;

    const [updatedUser] = await db
      .update(users)
      .set({ isActive: newIsActive })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, isActive: users.isActive });

    const actionText = newIsActive ? 'activated/unsuspended' : 'suspended';

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} has been ${actionText} successfully.`,
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update suspension status:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user suspension status' },
      { status: 500 }
    );
  }
}
