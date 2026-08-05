import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, jobSeekerProfiles, employerProfiles, businessPromoterProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { eq } from 'drizzle-orm';

// DELETE /api/admin/users/[id]/profile-image - Clear/remove user profile image or logo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id: userId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const suspendUser = searchParams.get('suspend') === 'true';

    // Clear avatarUrl from users & jobSeekerProfiles
    await db.update(users).set({ avatarUrl: null }).where(eq(users.id, userId));
    await db.update(jobSeekerProfiles).set({ avatarUrl: null }).where(eq(jobSeekerProfiles.userId, userId));
    
    // Clear logoUrl from employerProfiles & businessPromoterProfiles
    await db.update(employerProfiles).set({ logoUrl: null }).where(eq(employerProfiles.userId, userId));
    await db.update(businessPromoterProfiles).set({ logoUrl: null }).where(eq(businessPromoterProfiles.userId, userId));

    let actionNote = 'Profile image removed successfully.';

    if (suspendUser) {
      await db.update(users).set({ isActive: false }).where(eq(users.id, userId));
      actionNote = 'Profile image removed and user account suspended.';
    }

    return NextResponse.json({
      success: true,
      message: actionNote,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to moderate profile image:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove profile image' },
      { status: 500 }
    );
  }
}
