import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { jobCategories } from '@/db/schema';

// GET /api/admin/categories/job
export async function GET() {
  try {
    const categories = await db.select().from(jobCategories).orderBy(desc(jobCategories.createdAt));
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories/job
export async function POST(req: NextRequest) {
  try {
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

    const [newCat] = await db.insert(jobCategories).values({ name, imageUrl: imageUrl || null }).returning();
    return NextResponse.json({ success: true, message: 'Job category added', data: newCat }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to add category' }, { status: 500 });
  }
}
