import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, jobSeekerProfiles, employerProfiles, businessPromoterProfiles, userRoles, roles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { eq, isNotNull, or, ne } from 'drizzle-orm';

export interface ProfileImageItem {
  userId: string;
  email: string;
  role: string;
  roleId: number;
  profileName: string;
  imageUrl: string;
  imageType: 'avatar' | 'logo';
  isActive: boolean;
  createdAt: Date;
}

// GET /api/admin/profile-images - List all uploaded profile images/logos for moderation
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const items: ProfileImageItem[] = [];

    // 1. Fetch Job Seekers with avatarUrl
    const seekerRows = await db
      .select({
        userId: users.id,
        email: users.email,
        isActive: users.isActive,
        createdAt: users.createdAt,
        userAvatar: users.avatarUrl,
        seekerAvatar: jobSeekerProfiles.avatarUrl,
        firstName: jobSeekerProfiles.firstName,
        lastName: jobSeekerProfiles.lastName,
      })
      .from(users)
      .leftJoin(jobSeekerProfiles, eq(users.id, jobSeekerProfiles.userId))
      .where(
        or(
          isNotNull(users.avatarUrl),
          isNotNull(jobSeekerProfiles.avatarUrl)
        )
      );

    for (const r of seekerRows) {
      const img = r.seekerAvatar || r.userAvatar;
      if (img && img.trim() !== '') {
        const profileName = [r.firstName, r.lastName].filter(Boolean).join(' ') || r.email;
        items.push({
          userId: r.userId,
          email: r.email,
          role: 'Job Seeker',
          roleId: 1,
          profileName,
          imageUrl: img,
          imageType: 'avatar',
          isActive: r.isActive,
          createdAt: r.createdAt,
        });
      }
    }

    // 2. Fetch Employers with logoUrl
    const employerRows = await db
      .select({
        userId: users.id,
        email: users.email,
        isActive: users.isActive,
        createdAt: users.createdAt,
        logoUrl: employerProfiles.logoUrl,
        companyName: employerProfiles.companyName,
      })
      .from(employerProfiles)
      .innerJoin(users, eq(employerProfiles.userId, users.id))
      .where(isNotNull(employerProfiles.logoUrl));

    for (const r of employerRows) {
      if (r.logoUrl && r.logoUrl.trim() !== '') {
        items.push({
          userId: r.userId,
          email: r.email,
          role: 'Employer',
          roleId: 2,
          profileName: r.companyName || r.email,
          imageUrl: r.logoUrl,
          imageType: 'logo',
          isActive: r.isActive,
          createdAt: r.createdAt,
        });
      }
    }

    // 3. Fetch Business Promoters with logoUrl
    const promoterRows = await db
      .select({
        userId: users.id,
        email: users.email,
        isActive: users.isActive,
        createdAt: users.createdAt,
        logoUrl: businessPromoterProfiles.logoUrl,
        businessName: businessPromoterProfiles.businessName,
      })
      .from(businessPromoterProfiles)
      .innerJoin(users, eq(businessPromoterProfiles.userId, users.id))
      .where(isNotNull(businessPromoterProfiles.logoUrl));

    for (const r of promoterRows) {
      if (r.logoUrl && r.logoUrl.trim() !== '') {
        items.push({
          userId: r.userId,
          email: r.email,
          role: 'Business Promoter',
          roleId: 3,
          profileName: r.businessName || r.email,
          imageUrl: r.logoUrl,
          imageType: 'logo',
          isActive: r.isActive,
          createdAt: r.createdAt,
        });
      }
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to fetch profile images:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch profile images' },
      { status: 500 }
    );
  }
}
