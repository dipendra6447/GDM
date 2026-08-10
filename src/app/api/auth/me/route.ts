import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, jobSeekerProfiles, employerProfiles, businessPromoterProfiles } from '@/db/schema';
import { getAuthFromRequest } from '@/lib/auth';

// GET /api/auth/me
export async function GET(req: NextRequest) {
  try {
    const authPayload = await getAuthFromRequest(req);
    if (!authPayload) {
      return NextResponse.json({ success: true, authenticated: false, data: null });
    }

    const [user] = await db.select().from(users).where(eq(users.id, authPayload.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: true, authenticated: false, data: null });
    }

    // Always re-fetch roles from DB so newly-added roles are reflected
    // without requiring the user to re-login.
    const freshRoleRows = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));
    const userRoleIds = freshRoleRows.map((r) => r.roleId);

    // Fetch profile completion for every role the user holds — in parallel
    const profileCompletions: Record<string, number> = {};

    await Promise.all(
      userRoleIds.map(async (roleId) => {
        try {
          if (roleId === 1) {
            const [p] = await db.select({ c: jobSeekerProfiles.profileCompletion })
              .from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, user.id)).limit(1);
            profileCompletions['1'] = p?.c ?? 0;
          } else if (roleId === 2) {
            const [p] = await db.select({ c: employerProfiles.profileCompletion })
              .from(employerProfiles).where(eq(employerProfiles.userId, user.id)).limit(1);
            profileCompletions['2'] = p?.c ?? 0;
          } else if (roleId === 3) {
            const [p] = await db.select({ c: businessPromoterProfiles.profileCompletion })
              .from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, user.id)).limit(1);
            profileCompletions['3'] = p?.c ?? 0;
          }
        } catch {
          profileCompletions[String(roleId)] = 0;
        }
      })
    );

    // Primary completion = maximum across all roles the user holds
    const completionValues = Object.values(profileCompletions);
    const profileCompletion = completionValues.length
      ? Math.max(...completionValues)
      : 0;

    // Resolve avatar / logo URL from user or specific role profile tables
    let resolvedAvatarUrl = user.avatarUrl || null;

    if (!resolvedAvatarUrl) {
      try {
        const [jsProfile] = await db.select({ avatarUrl: jobSeekerProfiles.avatarUrl })
          .from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, user.id)).limit(1);
        if (jsProfile?.avatarUrl) {
          resolvedAvatarUrl = jsProfile.avatarUrl;
        } else {
          const [empProfile] = await db.select({ logoUrl: employerProfiles.logoUrl })
            .from(employerProfiles).where(eq(employerProfiles.userId, user.id)).limit(1);
          if (empProfile?.logoUrl) {
            resolvedAvatarUrl = empProfile.logoUrl;
          } else {
            const [bpProfile] = await db.select({ logoUrl: businessPromoterProfiles.logoUrl })
              .from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, user.id)).limit(1);
            if (bpProfile?.logoUrl) {
              resolvedAvatarUrl = bpProfile.logoUrl;
            }
          }
        }

        if (resolvedAvatarUrl) {
          await db.update(users).set({ avatarUrl: resolvedAvatarUrl }).where(eq(users.id, user.id));
        }
      } catch (err) {
        console.error('Failed to resolve profile avatar fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        avatarUrl: resolvedAvatarUrl,
        jobApplyCount: user.jobApplyCount,
        jobPostCount: user.jobPostCount,
        roles: userRoleIds,
        profileCompletion,
        profileCompletions,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('❌ Me error:', error?.stack || error?.message || error);
    const isDbMissing = !process.env.DATABASE_URL;
    return NextResponse.json({
      success: false,
      message: isDbMissing ? 'DATABASE_URL environment variable is missing in AWS Amplify Console.' : 'Failed to fetch user profile.',
      error: process.env.NODE_ENV === 'development' || isDbMissing ? error?.message : undefined,
    }, { status: 500 });
  }
}
