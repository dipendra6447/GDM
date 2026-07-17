import { NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db';
import { businessCategories } from '@/db/schema';

// GET /api/categories/business — Public endpoint (no auth required)
// Returns only active, non-deleted business categories for the frontend
export async function GET() {
  try {
    const categories = await db
      .select({
        id: businessCategories.id,
        name: businessCategories.name,
        imageUrl: businessCategories.imageUrl,
      })
      .from(businessCategories)
      .where(
        and(
          eq(businessCategories.isActive, true),
          eq(businessCategories.isDeleted, false)
        )
      )
      .orderBy(asc(businessCategories.name));

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Failed to fetch public business categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
