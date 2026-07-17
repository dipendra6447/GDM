import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, userRoles, businessPromoterProfiles } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// POST /api/admin/businesses
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { email, password, businessName, businessCategory, gstNumber, contactPhone } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }

    if (businessName) {
      const [existing] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.businessName, businessName)).limit(1);
      if (existing) {
        return NextResponse.json({ success: false, message: 'A business with this name is already registered.' }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({ email, passwordHash }).returning();
    await db.insert(userRoles).values({ userId: user.id, roleId: 3 });

    const [business] = await db.insert(businessPromoterProfiles).values({ userId: user.id, businessName, businessCategory, gstNumber, contactPhone }).returning();

    return NextResponse.json({ success: true, message: 'Business added', data: { user, business } }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to add business' }, { status: 500 });
  }
}
