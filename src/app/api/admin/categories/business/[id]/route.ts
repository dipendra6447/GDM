import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessCategories } from '@/db/schema';

// PUT /api/admin/categories/business/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    const [updated] = await db.update(businessCategories).set({ name }).where(eq(businessCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Business category updated', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/business/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [updated] = await db.update(businessCategories).set({ isDeleted: true }).where(eq(businessCategories.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Business category deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
