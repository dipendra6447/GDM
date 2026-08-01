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

    // Generate secure 32-byte crypto raw token for the email link
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store ONLY the SHA-256 hash of the token in the database to prevent database leak vulnerabilities
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration window

    // Insert hashed token into DB
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    // Build reset URL with the raw token for the recipient's email
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;

    // Send email via Resend
    const sendResult = await sendPasswordResetEmail({
      toEmail: user.email,
      resetUrl,
    });

    // Secure response payload — NEVER leak resetUrl/token in the HTTP JSON response
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email address, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('POST /api/auth/forgot-password error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to process request' }, { status: 500 });
  }
}
