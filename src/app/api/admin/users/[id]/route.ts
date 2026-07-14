import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  users, userRoles, roles, jobSeekerProfiles, employerProfiles,
  businessPromoterProfiles, workExperiences, educations, certifications, subscriptions,
  savedJobs, jobs
} from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id: userId } = await params;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const userRoleRows = await db
      .select({ roleId: userRoles.roleId, roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const roleIds = userRoleRows.map(r => r.roleId);

    let seekerProfile = null;
    let employerProfile = null;
    let promoterProfile = null;

    if (roleIds.includes(1)) {
      const [p] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
      seekerProfile = p || null;
    }
    if (roleIds.includes(2)) {
      const [p] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1);
      employerProfile = p || null;
    }
    if (roleIds.includes(3)) {
      const [p] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, userId)).limit(1);
      promoterProfile = p || null;
    }

    let experiences: any[] = [];
    let educationList: any[] = [];
    let certificationList: any[] = [];
    let userSavedJobs: any[] = [];

    if (roleIds.includes(1)) {
      experiences = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));
      educationList = await db.select().from(educations).where(eq(educations.userId, userId));
      certificationList = await db.select().from(certifications).where(eq(certifications.userId, userId));
      userSavedJobs = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          companyName: jobs.companyName,
          location: jobs.location,
          salaryRange: jobs.salaryRange,
          jobType: jobs.jobType,
          isActive: jobs.isActive,
          createdAt: jobs.createdAt,
        })
        .from(savedJobs)
        .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
        .where(and(eq(savedJobs.userId, userId), eq(jobs.isDeleted, false)));
    }

    const userSubs = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        id: user.id, email: user.email, jobApplyCount: user.jobApplyCount, jobPostCount: user.jobPostCount,
        createdAt: user.createdAt, roles: userRoleRows, seekerProfile, employerProfile,
        promoterProfile, experiences, educations: educationList, certifications: certificationList, subscriptions: userSubs,
        savedJobs: userSavedJobs,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch user details' }, { status: 500 });
  }
}
