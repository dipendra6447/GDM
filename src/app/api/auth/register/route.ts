import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, jobSeekerProfiles, employerProfiles, businessPromoterProfiles } from '@/db/schema';
import { signToken, JwtPayload } from '@/lib/auth';
import { COOKIE_OPTIONS } from '@/lib/constants';

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const { email, password, role, profile } = await req.json() as {
      email: string;
      password: string;
      role?: 'job_seeker' | 'job_poster' | 'business_promoter';
      profile?: Record<string, unknown>;
    };

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    // Map role name to roleId
    const ROLE_MAP: Record<string, number> = {
      job_seeker: 1,
      job_poster: 2,
      business_promoter: 3,
    };
    const selectedRole = role || 'job_seeker';
    const roleId = ROLE_MAP[selectedRole];

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ email, passwordHash }).returning();

    // Assign the selected role
    await db.insert(userRoles).values({ userId: user.id, roleId });

    // Create role-specific profile if profile data is provided
    let profileData = null;
    if (profile && Object.keys(profile).length > 0) {
      try {
        if (selectedRole === 'job_seeker') {
          const { title, firstName, middleName, lastName, phone, address, totalExperienceYears, skills } = profile as any;
          const [created] = await db.insert(jobSeekerProfiles).values({
            userId: user.id,
            title: title || undefined,
            firstName: firstName || undefined,
            middleName: middleName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
            address: address || undefined,
            totalExperienceYears: totalExperienceYears ? Number(totalExperienceYears) : undefined,
            skills: skills || undefined,
          }).returning();
          profileData = created;
        } else if (selectedRole === 'job_poster') {
          const { companyName, industry, companySize, headquarters, hrName, hrEmail, hrPhone } = profile as any;
          const [created] = await db.insert(employerProfiles).values({
            userId: user.id,
            companyName, industry, companySize, headquarters, hrName, hrEmail, hrPhone,
          }).returning();
          profileData = created;
        } else if (selectedRole === 'business_promoter') {
          const { businessName, businessCategory, contactPhone, contactEmail, address, gstNumber } = profile as any;
          const [created] = await db.insert(businessPromoterProfiles).values({
            userId: user.id,
            businessName, businessCategory, contactPhone, contactEmail, address, gstNumber,
          }).returning();
          profileData = created;
        }
      } catch (profileErr: any) {
        console.error('⚠️ Profile creation failed (user created):', profileErr.message);
      }
    }

    const token = await signToken({ userId: user.id, email: user.email, roles: [roleId] });

    const response = NextResponse.json({
      success: true,
      message: 'Account created',
      data: { id: user.id, email: user.email, roles: [selectedRole], profile: profileData },
      token,
    }, { status: 201 });

    response.cookies.set('token', token, COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    console.error('❌ Register error:', error.message);
    return NextResponse.json({ success: false, message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
