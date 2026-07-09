import { NextRequest, NextResponse } from 'next/server';
import { count, eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, roles, jobs, jobApplications, subscriptions, businessPromotions } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    // Total users
    const [{ value: totalUsers }] = await db.select({ value: count() }).from(users);

    // Users by role
    const roleCounts = await db
      .select({ roleName: roles.name, value: count() })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .groupBy(roles.name);

    const roleCountMap: Record<string, number> = {};
    for (const rc of roleCounts) {
      roleCountMap[rc.roleName] = rc.value;
    }

    // Total jobs, active jobs
    const [{ value: totalJobs }] = await db.select({ value: count() }).from(jobs);
    const [{ value: activeJobs }] = await db
      .select({ value: count() })
      .from(jobs)
      .where(and(eq(jobs.isActive, true), eq(jobs.isDeleted, false)));

    // Total applications
    const [{ value: totalApplications }] = await db.select({ value: count() }).from(jobApplications);

    // Active subscriptions
    const [{ value: activeSubscriptions }] = await db
      .select({ value: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    // Pending promotions
    const [{ value: pendingPromotions }] = await db
      .select({ value: count() })
      .from(businessPromotions)
      .where(eq(businessPromotions.status, 'pending_approval'));

    // Recent users (last 5)
    const recentUsers = await db
      .select({ id: users.id, email: users.email, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    // Recent jobs (last 5)
    const recentJobs = await db
      .select({
        id: jobs.id, title: jobs.title, companyName: jobs.companyName, isActive: jobs.isActive,
        createdAt: jobs.createdAt, employerEmail: users.email,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.employerId, users.id))
      .where(eq(jobs.isDeleted, false))
      .orderBy(desc(jobs.createdAt))
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, roleCounts: roleCountMap, totalJobs, activeJobs, totalApplications,
        activeSubscriptions, pendingPromotions, recentUsers, recentJobs,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
