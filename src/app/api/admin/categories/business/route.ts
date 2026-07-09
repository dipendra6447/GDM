import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { businessCategories } from '@/db/schema';

// GET /api/admin/categories/business
export async function GET() {
  try {
    const categories = await db.select().from(businessCategories).orderBy(desc(businessCategories.createdAt));
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories/business
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    const [newCat] = await db.insert(businessCategories).values({ name }).returning();
    return NextResponse.json({ success: true, message: 'Business category added', data: newCat }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to add category' }, { status: 500 });
  }
}
