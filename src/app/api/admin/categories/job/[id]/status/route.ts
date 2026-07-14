import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobCategories } from '@/db/schema';

// PATCH /api/admin/categories/job/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'isActive must be a boolean' }, { status: 400 });
    }

    const [updated] = await db.update(jobCategories).set({ isActive }).where(eq(jobCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: `Job category ${isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update category status' }, { status: 500 });
  }
}
