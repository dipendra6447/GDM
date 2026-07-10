import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobCategories } from '@/db/schema';

// PUT /api/admin/categories/job/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';
    let name = '';
    let imageUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const { parseFormData } = await import('@/lib/upload');
      const { fields, files } = await parseFormData(req);
      name = fields.name;
      imageUrl = fields.imageUrl || '';
      const imageFile = files.find((f: any) => f.fieldname === 'image');
      if (imageFile) imageUrl = imageFile.filepath;
    } else {
      const data = await req.json();
      name = data.name;
      imageUrl = data.imageUrl || '';
    }

    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    // Ensure we only update imageUrl if it was provided, or allow clearing if explicitly sent as empty string (handle this according to UI needs)
    const updateData: any = { name };
    if (imageUrl !== undefined && imageUrl !== '') updateData.imageUrl = imageUrl;

    const [updated] = await db.update(jobCategories).set(updateData).where(eq(jobCategories.id, id)).returning();
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
