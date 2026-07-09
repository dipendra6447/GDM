import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobCategories } from '@/db/schema';

// PUT /api/admin/categories/job/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    const [updated] = await db.update(jobCategories).set({ name }).where(eq(jobCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Job category updated', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/job/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [updated] = await db.update(jobCategories).set({ isDeleted: true }).where(eq(jobCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Job category deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
