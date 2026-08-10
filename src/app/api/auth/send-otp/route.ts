import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verificationTokens, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmailOtp } from '@/lib/resend';
import { sendSmsOtp } from '@/lib/sms';

// POST /api/auth/send-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, identifier, userId } = body; // type: 'email' | 'phone'

    if (!type || !identifier) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters: type and identifier' },
        { status: 400 }
      );
    }

    if (type !== 'email' && type !== 'phone') {
      return NextResponse.json(
        { success: false, message: 'Type must be either "email" or "phone"' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 2. Invalidate previous unused OTP tokens for this identifier & type
    await db
      .update(verificationTokens)
      .set({ isUsed: true })
      .where(
        and(
          eq(verificationTokens.identifier, cleanIdentifier),
          eq(verificationTokens.type, type),
          eq(verificationTokens.isUsed, false)
        )
      );

    // 3. Store new OTP token in database
    await db.insert(verificationTokens).values({
      userId: userId || null,
      identifier: cleanIdentifier,
      type,
      otpCode,
      expiresAt,
      isUsed: false,
    });

    // 4. Dispatch OTP via Resend or SMS provider
    let dispatchResult: any;
    if (type === 'email') {
      dispatchResult = await sendEmailOtp({ toEmail: cleanIdentifier, otpCode });
    } else {
      dispatchResult = await sendSmsOtp({ phone: identifier.trim(), otpCode });
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'SMS'} verification OTP sent successfully.`,
      simulated: dispatchResult?.simulated || false,
      // Note: for development convenience, log simulated notice in response if simulated
      resendNote: dispatchResult?.simulated ? `[Dev Mode] OTP Code is: ${otpCode}` : undefined,
    });
  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send OTP verification code' },
      { status: 500 }
    );
  }
}
