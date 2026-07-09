import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles } from '@/db/schema';
import { signToken } from '@/lib/auth';
import { COOKIE_OPTIONS } from '@/lib/constants';

// GET /api/auth/google/callback — Handle Google OAuth callback
export async function GET(req: NextRequest) {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    const redirectUri = `${FRONTEND_URL}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    const tokenData = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    const profile = await userInfoRes.json();
    const email = profile.email;
    const googleId = profile.id;
    const avatarUrl = profile.picture;

    if (!email) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Check if user exists by googleId
    let [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

    if (!user) {
      // Check if user exists by email (to link accounts)
      [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user) {
        // Update user to link Google ID and avatar
        [user] = await db.update(users)
          .set({ googleId, avatarUrl })
          .where(eq(users.id, user.id))
          .returning();
      } else {
        // Create brand new user
        [user] = await db.insert(users).values({
          email,
          googleId,
          avatarUrl,
        }).returning();

        // Default role: job_seeker (roleId = 1)
        await db.insert(userRoles).values({ userId: user.id, roleId: 1 });
      }
    }

    // Fetch roles
    const roleRows = await db.select({ roleId: userRoles.roleId }).from(userRoles).where(eq(userRoles.userId, user.id));
    const roleIds = roleRows.map((r) => r.roleId);

    const token = await signToken({ userId: user.id, email: user.email, roles: roleIds });

    const response = NextResponse.redirect(`${FRONTEND_URL}/?token=${token}`);
    response.cookies.set('token', token, COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    console.error('❌ Google OAuth callback error:', error.message);
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
}
