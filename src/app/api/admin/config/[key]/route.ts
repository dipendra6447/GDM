import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { globalConfigs } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

// PATCH /api/admin/config/[key]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { key } = await params;
    const { value } = await req.json();

    const [updated] = await db.update(globalConfigs).set({ value }).where(eq(globalConfigs.key, key)).returning();
    if (!updated) return NextResponse.json({ success: false, message: `Config key '${key}' not found` }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Config updated', data: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to update config' }, { status: 500 });
  }
}
