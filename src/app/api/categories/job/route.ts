import { NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db';
import { jobCategories } from '@/db/schema';

// GET /api/categories/job — Public endpoint (no auth required)
// Returns only active, non-deleted job categories for the frontend
export async function GET() {
  try {
    const categories = await db
      .select({
        id: jobCategories.id,
        name: jobCategories.name,
        imageUrl: jobCategories.imageUrl,
      })
      .from(jobCategories)
      .where(
        and(
          eq(jobCategories.isActive, true),
          eq(jobCategories.isDeleted, false)
        )
      )
      .orderBy(asc(jobCategories.name));

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Failed to fetch public job categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
