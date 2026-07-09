import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles } from '@/db/schema';
import { signToken } from '@/lib/auth';
import { COOKIE_OPTIONS } from '@/lib/constants';

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ success: false, message: 'Please sign in using your Google or LinkedIn account.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch all roles for the user
    const roleRows = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleIds = roleRows.map((r) => r.roleId);

    const token = await signToken({ userId: user.id, email: user.email, roles: roleIds });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { id: user.id, email: user.email, roleIds },
      token,
    });

    response.cookies.set('token', token, COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    console.error('❌ Login error:', error.stack || error);
    return NextResponse.json({ success: false, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
