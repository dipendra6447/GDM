import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, roles, employerProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// GET /api/admin/users
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: users.id, email: users.email, jobApplyCount: users.jobApplyCount, jobPostCount: users.jobPostCount,
        isActive: users.isActive, isDeleted: users.isDeleted, createdAt: users.createdAt, roleId: userRoles.roleId, roleName: roles.name,
        employerProfile: employerProfiles,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(employerProfiles, eq(users.id, employerProfiles.userId))
      .limit(limit)
      .offset(offset);

    const userMap = new Map<string, any>();
    for (const row of rows) {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id, email: row.email, jobApplyCount: row.jobApplyCount,
          isActive: row.isActive, isDeleted: row.isDeleted,
          jobPostCount: row.jobPostCount, createdAt: row.createdAt, roles: [],
          employerProfile: row.employerProfile,
        });
      }
      if (row.roleId && row.roleName) {
        userMap.get(row.id).roles.push({ roleId: row.roleId, roleName: row.roleName });
      }
    }

    return NextResponse.json({ success: true, data: Array.from(userMap.values()), meta: { page, limit } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}
