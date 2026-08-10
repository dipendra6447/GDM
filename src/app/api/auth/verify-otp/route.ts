import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verificationTokens, users } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

// POST /api/auth/verify-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, identifier, otpCode, userId } = body; // type: 'email' | 'phone'

    if (!type || !identifier || !otpCode) {
      return NextResponse.json(
        { success: false, message: 'Missing type, identifier, or otpCode' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Find matching valid unexpired OTP token
    const now = new Date();
    const [matchedToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, cleanIdentifier),
          eq(verificationTokens.type, type),
          eq(verificationTokens.otpCode, otpCode.trim()),
          eq(verificationTokens.isUsed, false),
          gt(verificationTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!matchedToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // 2. Mark token as used
    await db
      .update(verificationTokens)
      .set({ isUsed: true })
      .where(eq(verificationTokens.id, matchedToken.id));

    // 3. Update user verification status if userId or user record exists
    const targetUserId = userId || matchedToken.userId;
    if (targetUserId) {
      if (type === 'email') {
        await db
          .update(users)
          .set({ isEmailVerified: true })
          .where(eq(users.id, targetUserId));
      } else {
        await db
          .update(users)
          .set({ isPhoneVerified: true, phone: identifier.trim() })
          .where(eq(users.id, targetUserId));
      }
    } else {
      // If user isn't created yet (e.g. signup flow), search user by email/phone
      if (type === 'email') {
        await db
          .update(users)
          .set({ isEmailVerified: true })
          .where(eq(users.email, cleanIdentifier));
      } else if (type === 'phone') {
        await db
          .update(users)
          .set({ isPhoneVerified: true })
          .where(eq(users.phone, identifier.trim()));
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'Phone number'} verified successfully!`,
      verifiedType: type,
    });
  } catch (error: any) {
    console.error('❌ Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
