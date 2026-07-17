import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// POST /api/auth/google/disconnect — Disconnect Google OAuth from user account
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    // Fetch the user to check if they have a password hash
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Security check: Don't allow disconnecting Google if the user doesn't have a password set
    // Otherwise they would be locked out of their account completely!
    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        message: 'Cannot disconnect Google account because you have not set a password yet. Please set a password first.'
      }, { status: 400 });
    }

    // Update user to clear googleId
    await db.update(users)
      .set({ googleId: null })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, message: 'Google account disconnected successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Google disconnect error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to disconnect Google account' }, { status: 500 });
  }
}
