import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { sendPasswordResetEmail } from '@/lib/resend';

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up user
    const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, cleanEmail)).limit(1);

    // For security, return consistent message
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email address, a password reset link has been sent.',
      });
    }

    // Delete existing reset tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    // Generate secure 32-byte crypto token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Insert token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Build reset URL
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Send email via Resend
    const sendResult = await sendPasswordResetEmail({
      toEmail: user.email,
      resetUrl,
    });

    const responsePayload: Record<string, any> = {
      success: true,
      message: 'If an account exists with that email address, a password reset link has been sent.',
    };

    // Attach devResetUrl when running locally or if Resend sandbox restricts unverified recipients
    if (process.env.NODE_ENV !== 'production' || !sendResult.success || sendResult.simulated) {
      responsePayload.devResetUrl = resetUrl;
      if (sendResult.error?.message) {
        responsePayload.resendNote = sendResult.error.message;
      }
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('POST /api/auth/forgot-password error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to process request' }, { status: 500 });
  }
}
