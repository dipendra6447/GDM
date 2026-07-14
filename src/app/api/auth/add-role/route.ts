import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { userRoles } from '@/db/schema';
import { requireAuth, signToken } from '@/lib/auth';
import { COOKIE_OPTIONS } from '@/lib/constants';

// POST /api/auth/add-role
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const { roleId } = await req.json();
    const targetRoleId = parseInt(roleId, 10);

    if (![1, 2, 3].includes(targetRoleId)) {
      return NextResponse.json({ success: false, message: 'Invalid role ID' }, { status: 400 });
    }

    const userId = authPayload.userId;

    // Check if user already has the role
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, targetRoleId)))
      .limit(1);

    if (existingRole.length > 0) {
      return NextResponse.json({ success: true, message: 'Role already exists' });
    }

    // Insert new role
    await db.insert(userRoles).values({ userId, roleId: targetRoleId });

    // Fetch updated roles
    const roleRows = await db.select({ roleId: userRoles.roleId }).from(userRoles).where(eq(userRoles.userId, userId));
    const roleIds = roleRows.map((r) => r.roleId);

    // Issue new token
    const token = await signToken({ userId, email: authPayload.email, roles: roleIds });

    const response = NextResponse.json({ success: true, message: 'Role added successfully' });
    response.cookies.set('token', token, COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Add Role error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to add role.' }, { status: 500 });
  }
}
