import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, roles, userRoles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// POST /api/admin/users/assign-role
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { userId, roleId } = await req.json();

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });

    await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
    return NextResponse.json({ success: true, message: `Role '${role.name}' assigned to user` });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to assign role' }, { status: 500 });
  }
}
