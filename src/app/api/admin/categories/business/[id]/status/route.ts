import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessCategories } from '@/db/schema';

// PATCH /api/admin/categories/business/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'isActive must be a boolean' }, { status: 400 });
    }

    const [updated] = await db.update(businessCategories).set({ isActive }).where(eq(businessCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: `Business category ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update category status' }, { status: 500 });
  }
}
