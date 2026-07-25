import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid or missing reset token' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Look up active token
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token.trim()), gt(passwordResetTokens.expiresAt, new Date())))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json({ success: false, message: 'Invalid or expired password reset link. Please request a new one.' }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, tokenRecord.userId));

    // Delete token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenRecord.id));

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('POST /api/auth/reset-password error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to reset password' }, { status: 500 });
  }
}
